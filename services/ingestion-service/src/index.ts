import express from 'express';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(express.json());

const envSchema = z.object({
  PORT: z.string().optional(),
  ARTICLE_SERVICE_URL: z.string().url().optional(),
  INGEST_INTERVAL_MS: z.string().regex(/^\d+$/).optional(),
  INGESTION_KEY: z.string().optional()
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('Invalid env configuration', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}
const PORT = process.env.PORT || 8004;
const ARTICLE_SERVICE_URL = process.env.ARTICLE_SERVICE_URL || 'http://article-service:8002';
const INGEST_INTERVAL_MS = parseInt(process.env.INGEST_INTERVAL_MS || '300000', 10); // 5m default
const INGESTION_KEY = process.env.INGESTION_KEY || '';

interface FeedSource { name: string; url: string; category: string; }

const sources: FeedSource[] = [
  { name: 'NewsDay', url: 'https://www.newsday.co.zw/feed/', category: 'Politics' },
  { name: 'The Herald', url: 'https://www.herald.co.zw/feed/', category: 'Politics' },
  { name: 'Chronicle', url: 'https://www.chronicle.co.zw/feed/', category: 'Business' },
  { name: 'New Zimbabwe', url: 'https://www.newzimbabwe.com/feed/', category: 'Politics' },
  { name: 'Nehanda Radio', url: 'https://nehandaradio.com/feed/', category: 'General' }
];

// Simple timeout wrapper for global fetch
async function fetchWithTimeout(url: string, ms = 15000, init: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchRss(source: FeedSource) {
  try {
    const res = await fetchWithTimeout(source.url, 15000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const json = parser.parse(text);
    const items = json?.rss?.channel?.item || [];
    return items.slice(0, 10).map((item: any) => ({
      headline: item.title,
      url: item.link,
      snippet: item.description?.replace(/<[^>]+>/g, '').slice(0, 300),
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
      sourceName: source.name,
      categoryName: source.category,
      imageUrl: undefined
    }));
  } catch (e) {
    console.error('RSS fetch error', source.url, e);
    return [];
  }
}

async function ingestOnce() {
  const started = Date.now();
  console.log('[ingestion] cycle start');
  // shuffle sources to distribute load
  const shuffled = [...sources].sort(() => Math.random() - 0.5);
  const batches = await Promise.all(shuffled.map(fetchRss));
  const flat = batches.flat();
  if (!flat.length) { console.log('[ingestion] no articles fetched'); return; }
  try {
    const res = await fetch(`${ARTICLE_SERVICE_URL}/internal/articles/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ingestion-Key': INGESTION_KEY
      },
      body: JSON.stringify(flat)
    });
    const data = await res.json();
    console.log('[ingestion] result', data);
  } catch (e) {
    console.error('[ingestion] post error', e);
  }
  console.log(`[ingestion] cycle end duration=${Date.now()-started}ms fetched=${flat.length}`);
}

// Jittered scheduling wrapper
function scheduleIngestion() {
  ingestOnce();
  setTimeout(scheduleIngestion, INGEST_INTERVAL_MS + Math.floor(Math.random() * 15000));
}

// Start loop (replace previous setInterval)
scheduleIngestion();

app.get('/health', (_req, res) => res.json({ status: 'ok', intervalMs: INGEST_INTERVAL_MS }));

app.listen(PORT, () => {
  console.log(`Ingestion service running on ${PORT}`);
});
