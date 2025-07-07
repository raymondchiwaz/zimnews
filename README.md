# Zim News Aggregator

A comprehensive news aggregation platform for Zimbabwean media, featuring intelligent ranking algorithms, journalist trust scores, and real-time engagement features.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 8+
- **Docker** and Docker Compose
- **Python** 3.11+ (for ingestion and ranking services)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd zim-news-aggregator
```

2. **Copy environment variables**
```bash
cp env.example .env
# Edit .env with your specific configuration
```

3. **Install dependencies**
```bash
npm run setup
```

4. **Start the development environment**
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Database services**: PostgreSQL, Redis, Elasticsearch, RabbitMQ

### Manual Setup (Alternative)

If you prefer to run services individually:

```bash
# Start infrastructure services
npm run docker:up

# Start backend services
npm run dev:backend

# Start frontend
npm run dev:frontend

# Start Python services
npm run dev:ingestion
npm run dev:ranking
```

## 📋 Project Structure

```
zim-news-aggregator/
├── frontend/                 # Next.js frontend application
├── services/
│   ├── api-gateway/         # API Gateway (Node.js/Express)
│   ├── user-service/        # User management (Node.js/Express)
│   ├── article-service/     # Article CRUD (Node.js/Express + Prisma)
│   ├── feed-service/        # Feed generation (Node.js/Express)
│   ├── ingestion-service/   # Web scraping (Python/FastAPI)
│   └── ranking-service/     # Algorithms (Python/FastAPI)
├── docs/                    # Documentation
├── docker-compose.yml       # Development environment
├── package.json            # Root package.json
└── README.md
```

## 🛠 Technology Stack

### Frontend
- **Next.js 14** with React 18 and TypeScript
- **Tailwind CSS** for styling
- **React Query** for state management
- **React Hook Form** for forms

### Backend
- **Node.js/Express** for API services
- **Python/FastAPI** for data processing
- **PostgreSQL** for primary database
- **Redis** for caching
- **Elasticsearch** for search
- **RabbitMQ** for message queuing

### Infrastructure
- **Docker** for containerization
- **Kong** for API Gateway
- **Prometheus/Grafana** for monitoring
- **AWS/GCP** for production deployment

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                  # Start all services
npm run dev:frontend         # Frontend only
npm run dev:backend          # Backend services only

# Database
npm run migrate              # Run database migrations
npm run seed                 # Seed database with sample data

# Testing
npm test                     # Run all tests
npm run lint                 # Lint all code

# Docker
npm run docker:up            # Start infrastructure
npm run docker:down          # Stop infrastructure
npm run docker:logs          # View logs
```

### Database Management

The project uses Prisma for database management:

```bash
# Generate Prisma client
cd services/article-service && npx prisma generate

# Create migration
cd services/article-service && npx prisma migrate dev --name migration_name

# Reset database
cd services/article-service && npx prisma migrate reset

# View database
cd services/article-service && npx prisma studio
```

### Adding New Sources

1. Navigate to the admin panel: http://localhost:3000/admin
2. Click "Add Source"
3. Configure the scraping parameters
4. Test the scraper configuration

## 📊 Features

### Core Features
- ✅ **News Aggregation**: Automated scraping from 15+ Zimbabwean sources
- ✅ **User Authentication**: Secure JWT-based authentication
- ✅ **Trending Algorithm**: Time-decay + engagement weighting
- ✅ **Search**: Full-text search with Elasticsearch
- ✅ **Engagement**: Like, upvote, and share articles
- ✅ **Categories**: Politics, Business, Sports, Technology, etc.

### Advanced Features
- ✅ **Journalist Trust Score**: Multi-factor credibility assessment
- ✅ **Source Classification**: State vs Independent vs Diaspora
- ✅ **Real-time Updates**: WebSocket connections for live engagement
- ✅ **Mobile Responsive**: Optimized for all devices
- ✅ **Admin Panel**: Source and content management

### Upcoming Features
- 🔄 **Mobile Apps**: React Native applications
- 🔄 **AI Summarization**: Article summarization
- 🔄 **Personalization**: ML-based content recommendations
- 🔄 **API Access**: Public API for developers

## 🏗 Architecture

### Microservices Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Gateway    │────│  Load Balancer  │
│   (Next.js)     │    │   (Express)      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ User Service │ │Feed Service │ │Article    │
        │              │ │             │ │Service    │
        └──────────────┘ └─────────────┘ └───────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │Auth & Profile│ │Ranking Svc  │ │Ingestion  │
        │              │ │(Python)     │ │(Python)   │
        └──────────────┘ └─────────────┘ └───────────┘
```

### Data Flow

1. **Ingestion Service** scrapes news sources
2. **Article Service** processes and stores articles
3. **Ranking Service** calculates trending and trust scores
4. **Feed Service** generates personalized feeds
5. **Frontend** displays content to users

## 🔐 Security

- **JWT Authentication** with refresh tokens
- **Input Validation** on all endpoints
- **Rate Limiting** to prevent abuse
- **HTTPS** encryption in production
- **Environment Variables** for sensitive data
- **CORS** configuration for API access

## 📈 Monitoring & Analytics

- **Application Metrics**: Response times, error rates
- **Business Metrics**: User engagement, article performance
- **Infrastructure Metrics**: CPU, memory, database performance
- **User Analytics**: Page views, session duration, conversion rates

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build all services
npm run build

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/
```

### Environment Variables

Copy `env.example` to `.env` and configure:

- **Database URLs**: PostgreSQL, Redis, Elasticsearch
- **JWT Secret**: For authentication
- **External APIs**: NewsAPI, social media APIs
- **Email Settings**: For notifications
- **Analytics**: Google Analytics, monitoring tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **Code Style**: Use ESLint and Prettier
- **Testing**: Write tests for new features
- **Documentation**: Update README and API docs
- **Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🎯 Roadmap

### Phase 1 (Current) - Foundation
- [x] Core microservices architecture
- [x] Basic user authentication
- [x] Article scraping and storage
- [x] Simple frontend interface

### Phase 2 - Core Features
- [ ] Advanced trending algorithm
- [ ] Journalist trust scores
- [ ] Enhanced UI/UX
- [ ] Mobile optimization

### Phase 3 - Advanced Features
- [ ] Real-time notifications
- [ ] Personalization engine
- [ ] Analytics dashboard
- [ ] API monetization

### Phase 4 - Scale & Growth
- [ ] Mobile applications
- [ ] AI-powered features
- [ ] Regional expansion
- [ ] Enterprise features

---

Built with ❤️ for the Zimbabwean media landscape 