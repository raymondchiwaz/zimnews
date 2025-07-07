import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { Client } from '@elastic/elasticsearch';
import * as amqp from 'amqplib';

const app = express();
const port = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const elasticsearch = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(port, () => {
  console.log(`Article service listening at http://localhost:${port}`);
}); 