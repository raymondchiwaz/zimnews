import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import client from 'prom-client';
import { z } from 'zod';

const app = express();
const envSchema = z.object({
  PORT: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET too short'),
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://'))
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}
const port = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Metrics
const collectDefaultMetrics = client.collectDefaultMetrics; collectDefaultMetrics();
const httpHistogram = new client.Histogram({ name: 'user_request_duration_seconds', help: 'HTTP request duration', labelNames: ['method','route','status'], buckets: [0.05,0.1,0.2,0.3,0.5,1,2,5] });
app.use((req, res, next) => { const end = httpHistogram.startTimer(); res.on('finish', () => end({ method: req.method, route: req.route?.path || req.path, status: res.statusCode })); next(); });
app.get('/metrics', async (_req, res) => { res.set('Content-Type', client.register.contentType); res.end(await client.register.metrics()); });

// Health check endpoint
app.get('/health', (_req, res) => { res.json({ status: 'healthy' }); });

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors });
  const { username, email, password } = parsed.data;
  try {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { username, email, passwordHash } });
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (e) {
    console.error('Register error', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const loginSchema = z.object({ identifier: z.string(), password: z.string() });
app.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { identifier, password } = parsed.data;
  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server misconfigured' });
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, secret, { expiresIn: '2h' });
    res.json({ token });
  } catch (e) {
    console.error('Login error', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/profile', async (req, res) => {
  // Expect bearer token
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.substring(7);
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`User service listening at http://localhost:${port}`);
}); 