#!/bin/bash

# Zim News Aggregator - Project Initialization Script
# This script sets up the entire project from scratch

set -e  # Exit on any error

echo "🚀 Initializing Zim News Aggregator Project..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
print_status "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi
print_status "npm $(npm -v) detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi
print_status "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') detected"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi
print_status "Docker Compose detected"

# Check Python (optional)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
    print_status "Python $PYTHON_VERSION detected (optional)"
else
    print_warning "Python 3.11+ not found. Some advanced features may not work."
fi

echo ""
echo "📦 Setting up project structure..."

# Create necessary directories
mkdir -p services/{api-gateway,user-service,article-service,feed-service,ingestion-service,ranking-service}/src
mkdir -p frontend/src/{app,components,lib,hooks,types}
mkdir -p docs
mkdir -p scripts
mkdir -p kubernetes
mkdir -p .github/workflows

print_status "Project directories created"

# Copy environment variables
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_status "Environment variables copied from env.example"
    else
        print_warning "env.example not found. You'll need to create .env manually."
    fi
else
    print_status ".env file already exists"
fi

echo ""
echo "📚 Installing dependencies..."

# Install root dependencies
npm install
print_status "Root dependencies installed"

# Install service dependencies in parallel
echo "Installing service dependencies..."

# Backend services
for service in api-gateway user-service article-service feed-service; do
    if [ -f "services/$service/package.json" ]; then
        echo "Installing dependencies for $service..."
        (cd "services/$service" && npm install) &
    fi
done

# Frontend dependencies
if [ -f "frontend/package.json" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install) &
fi

# Wait for all background jobs to complete
wait
print_status "All dependencies installed"

echo ""
echo "🐳 Setting up Docker environment..."

# Start infrastructure services
docker-compose up -d postgres redis elasticsearch rabbitmq

print_status "Infrastructure services started"

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

echo ""
echo "🗄️  Setting up database..."

# Generate Prisma client and run migrations
if [ -f "services/article-service/package.json" ]; then
    cd services/article-service
    
    # Generate Prisma client
    npx prisma generate
    print_status "Prisma client generated"
    
    # Run migrations
    npx prisma migrate dev --name init
    print_status "Database migrations completed"
    
    # Seed database with initial data
    if [ -f "prisma/seed.ts" ]; then
        npx prisma db seed
        print_status "Database seeded with initial data"
    fi
    
    cd ../..
fi

echo ""
echo "🌐 Building services..."

# Build all services
npm run build
print_status "All services built successfully"

echo ""
echo "🎉 Project initialization completed!"
echo "=================================="

echo ""
echo "🚀 Quick Start Commands:"
echo "  npm run dev              # Start all services"
echo "  npm run docker:logs      # View service logs"
echo "  npm run docker:down      # Stop all services"
echo ""

echo "🌐 Service URLs:"
echo "  Frontend:      http://localhost:3000"
echo "  API Gateway:   http://localhost:8000"
echo "  API Docs:      http://localhost:8000/api"
echo "  Health Check:  http://localhost:8000/health"
echo ""

echo "🛠️  Admin URLs:"
echo "  RabbitMQ:      http://localhost:15672 (guest/guest)"
echo "  Elasticsearch: http://localhost:9200"
echo ""

echo "📖 Next Steps:"
echo "1. Start the development servers: npm run dev"
echo "2. Visit http://localhost:3000 to see your app"
echo "3. Add news sources via the admin panel"
echo "4. Check the README.md for detailed documentation"
echo ""

print_status "Initialization script completed successfully!"

# Start development servers
read -p "Would you like to start the development servers now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development servers..."
    npm run dev
fi 