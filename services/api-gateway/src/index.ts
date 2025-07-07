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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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

// Apply authentication middleware to protected routes
const protectedRoutes = [
  '/api/articles/*/vote',
  '/api/articles/*/share',
  '/api/users/profile',
  '/api/admin/*'
];

protectedRoutes.forEach(route => {
  app.use(route, authMiddleware);
});

// Set up service proxies
Object.entries(serviceProxies).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
    ...config,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${path}:`, err);
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
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app; 