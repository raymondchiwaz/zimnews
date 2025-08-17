import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' }
  } : undefined
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => (req.headers['x-request-id'] as string) || randomUUID(),
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err: Error | undefined) => {
    if (err) return 'error';
    if ((res.statusCode || 0) >= 500) return 'error';
    if ((res.statusCode || 0) >= 400) return 'warn';
    return 'info';
  }
});
