import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

const checkService = async (name: string, url: string): Promise<ServiceStatus> => {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${url}/health`, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    });
    
    return {
      name,
      url,
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      name,
      url,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message || 'Unknown error'
    };
  }
};

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check with downstream services
router.get('/detailed', async (req: Request, res: Response) => {
  const services = [
    {
      name: 'User Service',
      url: process.env.USER_SERVICE_URL || 'http://localhost:8001'
    },
    {
      name: 'Article Service',
      url: process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002'
    },
    {
      name: 'Feed Service',
      url: process.env.FEED_SERVICE_URL || 'http://localhost:8003'
    },
    {
      name: 'Ingestion Service',
      url: process.env.INGESTION_SERVICE_URL || 'http://localhost:8004'
    },
    {
      name: 'Ranking Service',
      url: process.env.RANKING_SERVICE_URL || 'http://localhost:8005'
    }
  ];

  const serviceChecks = await Promise.all(
    services.map(service => checkService(service.name, service.url))
  );

  const allHealthy = serviceChecks.every(service => service.status === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    gateway: {
      status: 'healthy',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    },
    services: serviceChecks,
    summary: {
      total: serviceChecks.length,
      healthy: serviceChecks.filter(s => s.status === 'healthy').length,
      unhealthy: serviceChecks.filter(s => s.status === 'unhealthy').length
    }
  });
});

// Readiness probe
router.get('/ready', (req: Request, res: Response) => {
  // Check if all critical dependencies are available
  const criticalEnvVars = [
    'USER_SERVICE_URL',
    'ARTICLE_SERVICE_URL',
    'JWT_SECRET'
  ];

  const missingVars = criticalEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return res.status(503).json({
      status: 'not ready',
      message: 'Missing critical environment variables',
      missing: missingVars
    });
  }

  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Liveness probe
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export { router as healthRouter }; 