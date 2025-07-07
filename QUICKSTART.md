# 🚀 Quick Start - Get Running in 5 Minutes

## Prerequisites
- **Node.js 18+** and npm
- **Docker Desktop** (Windows/Mac) or Docker + Docker Compose (Linux)

## One-Command Setup

### Windows
```cmd
scripts\init-project.bat
```

### Linux/Mac
```bash
chmod +x scripts/init-project.sh && ./scripts/init-project.sh
```

### Manual Setup (if scripts don't work)
```bash
# 1. Copy environment variables
cp env.example .env

# 2. Install dependencies
npm install

# 3. Start infrastructure
docker-compose up -d

# 4. Wait 30 seconds, then start development
npm run dev
```

## What You Get

After running the setup:

- **🌐 Frontend**: http://localhost:3000
- **🔌 API**: http://localhost:8000
- **📚 API Docs**: http://localhost:8000/api
- **❤️ Health Check**: http://localhost:8000/health

## Test It's Working

1. Visit http://localhost:3000 - should show the homepage
2. Visit http://localhost:8000/health - should return `{"status": "healthy"}`
3. Check logs: `npm run docker:logs`

## Common Issues

### Port Conflicts
Edit `.env` and change ports:
```
API_GATEWAY_PORT=8080
FRONTEND_PORT=3001
```

### Docker Issues
```bash
# Restart Docker services
npm run docker:down
npm run docker:up

# Check if Docker is running
docker --version
```

### Can't Access Services
```bash
# Check what's running
docker ps

# Restart everything
npm run docker:down
npm run dev
```

## Next Steps

1. **Add News Sources**: Go to http://localhost:3000/admin
2. **Start Scraping**: Add Zimbabwean news sources 
3. **Customize**: Edit `frontend/src/components/`
4. **Deploy**: See deployment guide in README.md

## Essential Commands

```bash
npm run dev          # Start everything
npm run docker:down  # Stop everything  
npm run docker:logs  # View logs
npm run docker:up    # Start infrastructure only
```

## Project Structure

```
zim-news-aggregator/
├── frontend/              # Next.js React app
├── services/
│   ├── api-gateway/      # Routes requests
│   ├── user-service/     # Authentication
│   ├── article-service/  # Content management
│   └── ...
├── docker-compose.yml    # Local development
└── package.json         # Root commands
```

---

**🎉 That's it!** Your news aggregator is running at http://localhost:3000

For detailed documentation, see [README.md](README.md) 