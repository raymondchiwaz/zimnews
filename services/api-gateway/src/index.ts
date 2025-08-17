import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { healthRouter } from './routes/health';
import { validateEnv } from './utils/env';
import { httpLogger, logger } from './utils/logger';
import client from 'prom-client';

// Load environment variables
dotenv.config();

const app = express();
validateEnv();
const PORT = process.env.PORT || 8000;

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'gateway_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method','route','status'],
  buckets: [0.05,0.1,0.2,0.3,0.5,0.8,1,2,5]
});
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => end({ method: req.method, route: req.route?.path || req.path, status: res.statusCode }));
  next();
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Structured logging
app.use(httpLogger);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global base limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
}));

// Sensitive route specific limits
const makeLimiter = (max: number, windowMs = 15 * 60 * 1000) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Rate limit exceeded. Please slow down.'
});
app.use('/api/users/login', makeLimiter(20, 10 * 60 * 1000));
app.use('/api/users/register', makeLimiter(10, 60 * 60 * 1000));
app.use('/api/search', makeLimiter(120, 15 * 60 * 1000));

// Health check route
app.use('/health', healthRouter);

// Service proxy configurations
const serviceProxies = {
  '/api/users': {
    target: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
  },
  '/api/articles': {
    target: process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
    pathRewrite: { '^/api/articles': '' },
  },
  '/api/feed': {
    target: process.env.FEED_SERVICE_URL || 'http://localhost:8003',
    changeOrigin: true,
    pathRewrite: { '^/api/feed': '' },
  },
  '/api/search': {
    target: process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
    pathRewrite: { '^/api/search': '/search' },
  },
  '/api/journalists': {
    target: process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
    pathRewrite: { '^/api/journalists': '/journalists' },
  },
  '/api/sources': {
    target: process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
    pathRewrite: { '^/api/sources': '/sources' },
  },
  '/api/admin': {
    target: process.env.INGESTION_SERVICE_URL || 'http://localhost:8004',
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '' },
  }
};

// Apply authentication middleware to protected routes (wildcards handled via regex)
const protectedPatterns = [
  /^\/api\/articles\/.+\/vote$/,
  /^\/api\/articles\/.+\/share$/,
  /^\/api\/users\/profile$/,
  /^\/api\/admin\//
];
app.use((req, res, next) => {
  if (protectedPatterns.some(p => p.test(req.path))) {
    return authMiddleware(req, res, next);
  }
  next();
});

// Set up service proxies
Object.entries(serviceProxies).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
    ...config,
    onError: (err, req, res) => {
  logger.error({ err }, `Proxy error for ${path}`);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The requested service is currently unavailable. Please try again later.'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add request ID for tracing
      proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || Math.random().toString(36));
      
      // Forward user information if authenticated
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
    },
    logLevel: 'debug'
  }));
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    name: 'Zim News Aggregator API',
    version: '1.0.0',
    description: 'API Gateway for Zim News Aggregator',
    endpoints: {
      authentication: {
        'POST /api/users/register': 'Register a new user',
        'POST /api/users/login': 'Login user',
        'POST /api/users/logout': 'Logout user',
        'GET /api/users/profile': 'Get user profile (protected)'
      },
      articles: {
        'GET /api/articles': 'Get articles with pagination',
        'GET /api/articles/:id': 'Get single article',
        'POST /api/articles/:id/vote': 'Vote on article (protected)',
        'POST /api/articles/:id/share': 'Share article'
      },
      feed: {
        'GET /api/feed/trending': 'Get trending articles',
        'GET /api/feed/category/:id': 'Get articles by category',
        'GET /api/feed/latest': 'Get latest articles'
      },
      search: {
        'GET /api/search?q=query': 'Search articles'
      },
      journalists: {
        'GET /api/journalists': 'Get all journalists',
        'GET /api/journalists/:id': 'Get journalist profile'
      },
      sources: {
        'GET /api/sources': 'Get all sources',
        'GET /api/sources/:id': 'Get source details'
      },
      admin: {
        'GET /api/admin/sources': 'Manage scraping sources (protected)',
        'POST /api/admin/sources': 'Add new source (protected)',
        'GET /api/admin/scraper/status': 'Get scraper status (protected)'
      }
    },
    documentation: 'https://docs.zimnews.com/api'
  });
});

// Catch all route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: '/api'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API Gateway started');
  logger.info({ url: `/api` }, 'API documentation route');
  logger.info({ url: `/health` }, 'Health route');
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.warn({ signal }, 'Shutdown signal received');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force exit after timeout
  setTimeout(() => process.exit(1), 10000).unref();
};
['SIGTERM','SIGINT'].forEach(sig => process.on(sig as NodeJS.Signals, () => shutdown(sig)));

export default app; 