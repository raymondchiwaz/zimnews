# Environment Variables Setup Guide

This guide explains how to set up environment variables for the Zim News Aggregator project across different environments.

## 📁 Environment Files Overview

The project includes several environment configuration files:

```
📦 zimnews/
├── env.development      # Development environment
├── env.staging         # Staging environment  
├── env.production      # Production environment
├── env.test           # Testing environment
├── env.example        # Base example (copy from env.development)
└── services/
    ├── api-gateway/
    │   └── env.example # API Gateway specific config
    ├── user-service/
    │   └── env.example # User Service specific config
    └── frontend/
        └── env.example # Frontend specific config
```

## 🚀 Quick Setup

### 1. Copy Base Environment File

```bash
# Copy the development environment as your base .env
cp env.development .env

# Or if you want to start from the example:
cp env.example .env
```

### 2. Generate Secure Secrets

**For Development:**
```bash
# Generate JWT Secret (replace in .env)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**For Production:**
```bash
# Use a cryptographically secure random generator
openssl rand -hex 64  # For JWT_SECRET
openssl rand -hex 32  # For SESSION_SECRET
```

### 3. Update Critical Variables

Edit your `.env` file and update these essential variables:

```bash
# Database - Update with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret - MUST be changed from default
JWT_SECRET=your-generated-secret-here

# Email - Add your SMTP credentials
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔧 Environment-Specific Setup

### Development Environment

```bash
# Use the development environment file
cp env.development .env

# Update these for local development:
DATABASE_URL=postgresql://zimnews:development@localhost:5432/zimnews
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
RABBITMQ_URL=amqp://zimnews:development@localhost:5672
```

### Staging Environment

```bash
# Use the staging environment file
cp env.staging .env

# Update with staging infrastructure:
DATABASE_URL=postgresql://zimnews_staging:password@staging-db-host:5432/zimnews_staging
API_GATEWAY_URL=https://api-staging.zimnews.com
FRONTEND_URL=https://staging.zimnews.com
```

### Production Environment

```bash
# Use the production environment file
cp env.production .env

# Update with production infrastructure:
DATABASE_URL=postgresql://zimnews_prod:STRONG_PASSWORD@prod-db-host:5432/zimnews_prod
API_GATEWAY_URL=https://api.zimnews.com
FRONTEND_URL=https://zimnews.com

# CRITICAL: Update all secrets with strong, unique values
JWT_SECRET=GENERATE_CRYPTOGRAPHICALLY_SECURE_SECRET_HERE
SESSION_SECRET=GENERATE_STRONG_SESSION_SECRET_HERE
```

### Test Environment

```bash
# Use the test environment file  
cp env.test .env

# Test environment uses different ports and mock services
DATABASE_URL=postgresql://zimnews_test:test@localhost:5433/zimnews_test
API_GATEWAY_PORT=8100
FRONTEND_PORT=3100
```

## 🛠️ Service-Specific Configuration

### API Gateway Service

```bash
# Navigate to API Gateway directory
cd services/api-gateway

# Copy the service-specific environment file
cp env.example .env

# Key variables to configure:
SERVICE_PORT=8000
USER_SERVICE_URL=http://localhost:8001
ARTICLE_SERVICE_URL=http://localhost:8002
```

### User Service

```bash
# Navigate to User Service directory
cd services/user-service

# Copy the service-specific environment file
cp env.example .env

# Key variables to configure:
SERVICE_PORT=8001
DATABASE_URL=postgresql://zimnews:development@localhost:5432/zimnews
REDIS_URL=redis://localhost:6379
```

### Frontend Application

```bash
# Navigate to Frontend directory
cd frontend

# Copy the frontend-specific environment file
cp env.example .env.local

# Key variables to configure:
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🔐 Security Best Practices

### 1. Secret Management

- **Never commit `.env` files to version control**
- Use strong, unique secrets for each environment
- Rotate secrets regularly
- Use environment-specific secrets (don't reuse between dev/staging/prod)

### 2. Production Secrets

```bash
# Generate strong secrets for production:
JWT_SECRET=$(openssl rand -hex 64)
SESSION_SECRET=$(openssl rand -hex 32)
DATABASE_PASSWORD=$(openssl rand -base64 32)
```

### 3. Environment Isolation

- Use separate databases for each environment
- Use different API keys for external services
- Implement proper CORS policies per environment

## 📧 Email Configuration

### Gmail Setup

```bash
# Enable 2FA and generate app password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SendGrid (Production)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
```

### Mailtrap (Testing)

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

## 🔑 External API Keys

### Required API Keys

1. **NewsAPI** (Optional)
   ```bash
   NEWS_API_KEY=your-newsapi-key-here
   ```

2. **Google Analytics**
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Sentry Error Tracking**
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

4. **Social OAuth (Optional)**
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```

## 🐳 Docker Environment Variables

When using Docker Compose, create a `.env` file in the root directory:

```bash
# Database credentials for Docker Compose
POSTGRES_USER=zimnews
POSTGRES_PASSWORD=development
POSTGRES_DB=zimnews

# Redis (no password for development)
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_DEFAULT_USER=zimnews
RABBITMQ_DEFAULT_PASS=development
```

## 🧪 Testing Environment Variables

For running tests, create a `.env.test` file:

```bash
# Test database (separate from development)
DATABASE_URL=postgresql://zimnews_test:test@localhost:5433/zimnews_test

# Mock external services
NEWS_API_KEY=test-key
SMTP_HOST=localhost
SMTP_PORT=1025

# Disable external integrations
SENTRY_DSN=
ENABLE_ANALYTICS=false
```

## 🔄 Environment Loading Priority

The application loads environment variables in this order:

1. **System environment variables** (highest priority)
2. **`.env.local`** (local overrides, not committed)
3. **`.env.{NODE_ENV}`** (environment-specific)
4. **`.env`** (default values)

## 📝 Variable Categories

### Database & Infrastructure
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `ELASTICSEARCH_URL` - Elasticsearch endpoint
- `RABBITMQ_URL` - RabbitMQ connection string

### Authentication & Security
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE_TIME` - Token expiration
- `SESSION_SECRET` - Session signing secret
- `BCRYPT_ROUNDS` - Password hashing rounds

### External Services
- `NEWS_API_KEY` - NewsAPI access key
- `SMTP_*` - Email service configuration
- `SENTRY_DSN` - Error tracking
- `*_CLIENT_ID/*_CLIENT_SECRET` - OAuth providers

### Feature Flags
- `ENABLE_REGISTRATION` - User registration
- `ENABLE_SOCIAL_LOGIN` - OAuth authentication
- `ENABLE_COMMENTS` - Article comments
- `ENABLE_NOTIFICATIONS` - Push notifications

### Performance & Caching
- `CACHE_*_TTL` - Cache expiration times
- `RATE_LIMIT_*` - Rate limiting configuration
- `DB_POOL_*` - Database connection pooling

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify variables are loaded
   npm run dev -- --inspect-env
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   redis-cli -u $REDIS_URL ping
   ```

4. **Service Port Conflicts**
   ```bash
   # Check if ports are available
   lsof -i :8000
   lsof -i :8001
   ```

### Environment Validation

The application includes environment validation on startup. If required variables are missing, you'll see helpful error messages indicating what needs to be configured.

## 📚 Additional Resources

- [Node.js Environment Variables Best Practices](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [12-Factor App Configuration](https://12factor.net/config) 