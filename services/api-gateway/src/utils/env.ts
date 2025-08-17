import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
  USER_SERVICE_URL: z.string().url().optional(),
  ARTICLE_SERVICE_URL: z.string().url().optional(),
  FEED_SERVICE_URL: z.string().url().optional(),
  INGESTION_SERVICE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 chars')
});

let validated: z.infer<typeof schema> | null = null;

export function validateEnv() {
  if (validated) return validated;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Environment validation errors:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  validated = parsed.data;
  return validated;
}

export type Env = z.infer<typeof schema>;