@echo off
setlocal enabledelayedexpansion

:: Zim News Aggregator - Project Initialization Script (Windows)
:: This script sets up the entire project from scratch

echo 🚀 Initializing Zim News Aggregator Project...
echo ================================================
echo.

:: Check prerequisites
echo 🔍 Checking prerequisites...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)
echo ✅ Node.js detected: 
node --version

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)
echo ✅ npm detected: 
npm --version

:: Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker detected: 
docker --version

:: Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
        pause
        exit /b 1
    )
)
echo ✅ Docker Compose detected

echo.
echo 📦 Setting up project structure...

:: Create necessary directories
if not exist "services\api-gateway\src" mkdir "services\api-gateway\src"
if not exist "services\user-service\src" mkdir "services\user-service\src"
if not exist "services\article-service\src" mkdir "services\article-service\src"
if not exist "services\feed-service\src" mkdir "services\feed-service\src"
if not exist "services\ingestion-service\src" mkdir "services\ingestion-service\src"
if not exist "services\ranking-service\src" mkdir "services\ranking-service\src"
if not exist "frontend\src\app" mkdir "frontend\src\app"
if not exist "frontend\src\components" mkdir "frontend\src\components"
if not exist "frontend\src\lib" mkdir "frontend\src\lib"
if not exist "frontend\src\hooks" mkdir "frontend\src\hooks"
if not exist "frontend\src\types" mkdir "frontend\src\types"
if not exist "docs" mkdir "docs"
if not exist "scripts" mkdir "scripts"
if not exist "kubernetes" mkdir "kubernetes"
if not exist ".github\workflows" mkdir ".github\workflows"

echo ✅ Project directories created

:: Copy environment variables
if not exist ".env" (
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo ✅ Environment variables copied from env.example
    ) else (
        echo ⚠️  env.example not found. You'll need to create .env manually.
    )
) else (
    echo ✅ .env file already exists
)

echo.
echo 📚 Installing dependencies...

:: Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)
echo ✅ Root dependencies installed

:: Frontend dependencies
if exist "frontend\package.json" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Frontend dependencies installed
)

echo.
echo 🐳 Setting up Docker environment...

:: Start infrastructure services
echo Starting infrastructure services...
docker-compose up -d postgres redis elasticsearch rabbitmq
if %errorlevel% neq 0 (
    echo ❌ Failed to start infrastructure services
    pause
    exit /b 1
)
echo ✅ Infrastructure services started

:: Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo.
echo 🗄️  Setting up database...

:: Generate Prisma client and run migrations (if article service exists)
if exist "services\article-service\package.json" (
    cd services\article-service
    
    :: Install dependencies first
    echo Installing article service dependencies...
    call npm install
    
    :: Generate Prisma client
    echo Generating Prisma client...
    call npx prisma generate
    
    :: Run migrations
    echo Running database migrations...
    call npx prisma migrate dev --name init
    
    :: Seed database if seed file exists
    if exist "prisma\seed.ts" (
        echo Seeding database...
        call npx prisma db seed
    )
    
    cd ..\..
    echo ✅ Database setup completed
)

echo.
echo 🎉 Project initialization completed!
echo ==================================
echo.

echo 🚀 Quick Start Commands:
echo   npm run dev              # Start all services
echo   npm run docker:logs      # View service logs
echo   npm run docker:down      # Stop all services
echo.

echo 🌐 Service URLs:
echo   Frontend:      http://localhost:3000
echo   API Gateway:   http://localhost:8000
echo   API Docs:      http://localhost:8000/api
echo   Health Check:  http://localhost:8000/health
echo.

echo 🛠️  Admin URLs:
echo   RabbitMQ:      http://localhost:15672 (guest/guest)
echo   Elasticsearch: http://localhost:9200
echo.

echo 📖 Next Steps:
echo 1. Start the development servers: npm run dev
echo 2. Visit http://localhost:3000 to see your app
echo 3. Add news sources via the admin panel
echo 4. Check the README.md for detailed documentation
echo.

echo ✅ Initialization script completed successfully!
echo.

:: Ask if user wants to start development servers
set /p choice="Would you like to start the development servers now? (y/n): "
if /i "%choice%"=="y" (
    echo 🚀 Starting development servers...
    npm run dev
)

pause 