import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { Client } from '@elastic/elasticsearch';
import * as amqp from 'amqplib';
import client from 'prom-client';
import { z } from 'zod';

const app = express();
const envSchema = z.object({
  PORT: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  ELASTICSEARCH_URL: z.string().url().optional(),
  RABBITMQ_URL: z.string().optional(),
  INGESTION_KEY: z.string().optional(),
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://'))
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}
const port = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const elasticsearch = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

// Metrics
const collectDefaultMetrics = client.collectDefaultMetrics; collectDefaultMetrics();
const httpHistogram = new client.Histogram({ name: 'article_request_duration_seconds', help: 'HTTP request duration', labelNames: ['method','route','status'], buckets: [0.05,0.1,0.2,0.3,0.5,1,2,5] });
app.use((req, res, next) => { const end = httpHistogram.startTimer(); res.on('finish', () => end({ method: req.method, route: req.route?.path || req.path, status: res.statusCode })); next(); });
app.get('/metrics', async (_req, res) => { res.set('Content-Type', client.register.contentType); res.end(await client.register.metrics()); });

// Health check endpoint
app.get('/health', (_req, res) => { res.json({ status: 'healthy' }); });

// Internal ingestion endpoint (batch ingest articles)
const INGESTION_KEY = process.env.INGESTION_KEY || '';
interface IngestArticlePayload { headline: string; url: string; snippet?: string; publishedAt?: string; sourceName: string; categoryName: string; imageUrl?: string|null; }
app.post('/internal/articles/ingest', async (req, res) => {
  if (INGESTION_KEY && req.headers['x-ingestion-key'] !== INGESTION_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const body = req.body;
  const articles: IngestArticlePayload[] = Array.isArray(body) ? body : body?.articles;
  if (!Array.isArray(articles)) return res.status(400).json({ error: 'Bad payload' });
  let created = 0; let skipped = 0; const errors: string[] = [];
  for (const item of articles) {
    try {
      if (!item?.url || !item?.headline) { skipped++; continue; }
      // Ensure source
      const source = await prisma.source.upsert({
        where: { name: item.sourceName },
        update: {},
        create: { name: item.sourceName, baseUrl: new URL(item.url).origin, affiliation: 'OTHER' }
      });
      // Ensure category
      const category = await prisma.category.upsert({
        where: { name: item.categoryName || 'General' },
        update: {},
        create: { name: item.categoryName || 'General' }
      });
      // Create article if new
      await prisma.article.create({
        data: {
          headline: item.headline,
          url: item.url,
          snippet: item.snippet?.slice(0, 500) || null,
          imageUrl: item.imageUrl || null,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          sourceId: source.id,
          categoryId: category.id
        }
      });
      created++;
    } catch (e: any) {
      if (e?.code === 'P2002') { // unique constraint (url)
        skipped++; continue;
      }
      errors.push(`${item.url}: ${e?.message || 'error'}`);
    }
  }
  res.json({ received: articles.length, created, skipped, errors });
});

// Real articles endpoint with pagination
app.get('/articles', async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const pageSize = Math.min( parseInt(String(req.query.pageSize || '20'), 10), 50);
    const skip = (page - 1) * pageSize;

    const [total, records] = await Promise.all([
      prisma.article.count(),
      prisma.article.findMany({
        include: { source: true, category: true, journalist: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
      })
    ]);

    const data = records.map(a => ({
      id: a.id,
      title: a.headline,
      excerpt: a.snippet || a.content?.slice(0, 160) || '',
      source: a.source.name,
      publishedAt: a.publishedAt.toISOString(),
      imageUrl: a.imageUrl,
      category: a.category.name
    }));

    res.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items: data
    });
  } catch (e) {
    console.error('Error fetching articles', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Basic search (simple LIKE fallback until elastic integrated fully)
app.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing q parameter' });
    const results = await prisma.article.findMany({
      where: { headline: { contains: q, mode: 'insensitive' } },
      include: { source: true, category: true },
      orderBy: { publishedAt: 'desc' },
      take: 25
    });
    res.json(results.map(a => ({
      id: a.id,
      title: a.headline,
      excerpt: a.snippet || a.content?.slice(0,160) || '',
      source: a.source.name,
      publishedAt: a.publishedAt.toISOString(),
      category: a.category.name,
      imageUrl: a.imageUrl
    })));
  } catch (e) {
    console.error('Search error', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Article service listening at http://localhost:${port}`);
});