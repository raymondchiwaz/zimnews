# Quick Setup Guide

This guide will get your Zim News Aggregator running in **5 minutes**.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Python 3.11+ (optional, for advanced features)

## One-Command Setup

```bash
# Clone and setup (replace with your actual repo URL)
git clone https://github.com/your-username/zim-news-aggregator.git
cd zim-news-aggregator

# Copy environment variables
cp env.example .env

# Install all dependencies and start services
npm run setup && npm run dev
```

## What This Creates

After running the setup, you'll have:

- **Frontend**: http://localhost:3000 - Main website
- **API Gateway**: http://localhost:8000 - Central API endpoint
- **Admin Panel**: http://localhost:3000/admin - Source management
- **Database**: PostgreSQL, Redis, Elasticsearch automatically configured

## Testing the Setup

1. **Visit the homepage**: http://localhost:3000
2. **Check API health**: http://localhost:8000/health
3. **Register a user**: http://localhost:3000/register
4. **View API docs**: http://localhost:8000/api

## Development Workflow

```bash
# Start everything
npm run dev

# Start individual services
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend services only

# Database operations
npm run migrate         # Run database migrations
npm run seed           # Add sample data

# Stop everything
npm run docker:down
```

## Project Structure

```
zim-news-aggregator/
├── frontend/                 # Next.js app
├── services/
│   ├── api-gateway/         # Routes all requests
│   ├── user-service/        # Authentication
│   ├── article-service/     # Content management
│   ├── feed-service/        # News feeds
│   ├── ingestion-service/   # Web scraping
│   └── ranking-service/     # Algorithms
└── docker-compose.yml       # Local development
```

## Adding News Sources

1. Go to http://localhost:3000/admin
2. Click "Add Source"
3. Enter source details:
   - Name: "The Herald"
   - URL: "https://www.herald.co.zw"
   - Type: "RSS" or "Scraping"
   - Affiliation: "State"

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker --version

# Restart everything
npm run docker:down
npm run docker:up
```

### Database connection issues
```bash
# Reset database
npm run docker:down
docker volume rm zimnews_postgres_data
npm run setup:db
```

### Port conflicts
Edit `.env` file and change port numbers:
```
API_GATEWAY_PORT=8000
FRONTEND_PORT=3000
```

## Next Steps

1. **Add content**: Start scraping by adding news sources in admin panel
2. **Customize**: Edit frontend components in `frontend/src/components/`
3. **Deploy**: Follow deployment guide in main README.md
4. **Monitor**: Check http://localhost:8000/health/detailed for service status

## Environment Variables

Key variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://zimnews:development@localhost:5432/zimnews

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Common Commands

```bash
# View logs
npm run docker:logs

# Restart a specific service
docker-compose restart api-gateway

# Access database
docker exec -it zimnews-postgres psql -U zimnews -d zimnews

# Check service health
curl http://localhost:8000/health/detailed
```

## Support

- **Issues**: Check GitHub Issues
- **Docs**: See README.md for detailed documentation
- **Chat**: Discord/Slack community (if available)

---

🎉 **You're all set!** Visit http://localhost:3000 to see your news aggregator. 