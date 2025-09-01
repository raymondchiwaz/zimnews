## Run Zim News on AWS Free Tier

This guide shows how to deploy the project for $0 using AWS free tier:
- Backend (API, Postgres, Redis) on one EC2 t2.micro
- Frontend on AWS Amplify Hosting
- Heavy services (Elasticsearch, RabbitMQ, Ingestion) disabled to fit free tier

### Prerequisites
- AWS account with free tier enabled
- GitHub repository for this project
- SSH key pair for EC2 (PEM)

---

## Part A — Backend on EC2 (free tier)

### 1) Launch EC2 instance
- AMI: Amazon Linux 2023
- Instance type: t2.micro
- Storage: 20 GB gp3
- Security Group (restrict to your IP if possible):
  - Inbound: 22 (SSH), 8000 (API)
  - Keep 5432 (Postgres) and 6379 (Redis) closed to the internet

### 2) Connect via SSH
```bash
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_DNS>
```

### 3) Install Docker and Docker Compose plugin
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit
```
Reconnect to apply the docker group:
```bash
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_DNS>
sudo yum install -y docker-compose-plugin
```

### 4) (Recommended) Add swap (prevents OOM on t2.micro)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 5) Clone the repository
```bash
git clone <your-repo-url> zimnews
cd zimnews
```

### 6) Create environment file for secrets
Create a `.env` file in the project root with a strong JWT secret:
```bash
cat > .env << 'EOF'
JWT_SECRET=change_this_to_a_long_random_value
EOF
```

### 7) Add a compose override to disable heavy services
Create `docker-compose.override.yml` in the project root:
```yaml
version: "3.9"
services:
  postgres:
    restart: unless-stopped

  redis:
    restart: unless-stopped

  user-service:
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  article-service:
    restart: unless-stopped
    environment:
      - ELASTICSEARCH_URL=
      - RABBITMQ_URL=
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  api-gateway:
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - user-service
      - article-service

  # Disabled on free tier to save RAM/CPU
  elasticsearch:
    deploy:
      replicas: 0
  rabbitmq:
    deploy:
      replicas: 0
  ingestion-service:
    deploy:
      replicas: 0
```

### 8) Start database and cache
```bash
docker compose up -d postgres redis
```

### 9) Build services and run database migrations
Build images on first run:
```bash
docker compose build user-service article-service
```
Run Prisma migrations in both services:
```bash
docker compose run --rm user-service npx prisma migrate deploy
docker compose run --rm article-service npx prisma migrate deploy
```
Optional: seed article data if available:
```bash
docker compose run --rm article-service npm run seed || true
```

### 10) Start API services
```bash
docker compose up -d user-service article-service api-gateway
```

### 11) Verify health on the instance
```bash
curl http://localhost:8000/health
```
Note your `EC2_PUBLIC_DNS` for the frontend, e.g.:
`http://ec2-xx-xxx-xxx-xxx.compute-1.amazonaws.com:8000`

Services will restart automatically after reboots due to `restart: unless-stopped`.

---

## Part B — Frontend on AWS Amplify (free tier)

### 12) Connect the repository
- Open AWS Amplify Console → Host web app → Connect GitHub → select repo/branch.

### 13) Set environment variable
- In Amplify → App settings → Environment variables:
  - `NEXT_PUBLIC_API_URL` = `http://<EC2_PUBLIC_DNS>:8000`

### 14) Build and deploy
- Accept the default Next.js build settings and deploy.
- Open the Amplify URL and confirm the app loads from the EC2 API.

---

## Daily operations
- View logs:
```bash
docker compose logs -f api-gateway user-service article-service | cat
```
- Update to latest code:
```bash
cd ~/zimnews
git pull
docker compose build
docker compose up -d
```

## Notes and limitations (free tier)
- Search (Elasticsearch) and ingestion pipeline (RabbitMQ + ingestion-service) are disabled to fit memory/CPU.
- Core browsing and authentication should work; search endpoints will be unavailable until you upgrade (bigger instance or managed services).

## Optional (still $0 if low usage)
- Lock Security Group to your IP for port 8000.
- Add Nginx on EC2 to expose port 80 → proxy to `api-gateway:8000`.
- Use Amplify custom domain if you own one (domain costs extra).

## Alternative: host frontend on EC2
If you prefer everything on one instance (uses more RAM):
```bash
docker compose up -d frontend
```
Then browse `http://<EC2_PUBLIC_DNS>:3000`. Ensure frontend uses the API URL:
- In EC2 compose: `NEXT_PUBLIC_API_URL=http://api-gateway:8000` (internal)
- Or in Amplify: `NEXT_PUBLIC_API_URL=http://<EC2_PUBLIC_DNS>:8000` (external)


