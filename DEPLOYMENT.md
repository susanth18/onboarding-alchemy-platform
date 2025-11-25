# Deployment Guide

Complete guide for deploying the Onboarding Alchemy Platform to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development with Docker](#local-development-with-docker)
- [Production Deployment with Docker](#production-deployment-with-docker)
- [Cloud Deployment](#cloud-deployment)
  - [AWS](#aws-deployment)
  - [Google Cloud](#google-cloud-deployment)
  - [Azure](#azure-deployment)
  - [DigitalOcean](#digitalocean-deployment)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ (for local development without Docker)
- PostgreSQL 14+ (for production)
- Domain name with SSL certificate (for production)

### Optional
- SendGrid account (for email notifications)
- Azure OpenAI account (for AI features)
- AWS S3 bucket (for file storage)
- Redis instance (for caching and sessions)

## Local Development with Docker

### 1. Set Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd onboarding-alchemy-platform

# Create environment file
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your settings
# For local development, minimal config is:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5433/onboarding_dev"
# JWT_SECRET="your-secret-key"
```

### 2. Start Development Services

```bash
# Start PostgreSQL, Redis, and MailDev for local development
docker-compose -f docker-compose.dev.yml up -d

# This starts:
# - PostgreSQL on port 5433
# - Redis on port 6380
# - MailDev on port 1080 (web UI) and 1025 (SMTP)
```

### 3. Run Application Locally

```bash
# Install dependencies
npm install

# Initialize database
cd server
npm run db:generate
npm run db:migrate
npm run db:seed
cd ..

# Start both client and server
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **MailDev UI**: http://localhost:1080 (view sent emails)

### 4. Stop Development Services

```bash
docker-compose -f docker-compose.dev.yml down

# To remove volumes as well:
docker-compose -f docker-compose.dev.yml down -v
```

## Production Deployment with Docker

### 1. Prepare Environment

```bash
# Create .env file for production
cat > .env << 'EOF'
# JWT
JWT_SECRET=<generate-strong-random-key-min-32-chars>

# Email (choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=<your-sendgrid-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Company HR

# Or use SMTP
# EMAIL_PROVIDER=nodemailer
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Azure OpenAI (optional)
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
EOF
```

### 2. Build and Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec server npx prisma migrate deploy

# Seed database (optional)
docker-compose exec server npm run db:seed
```

### 4. Verify Deployment

```bash
# Check health
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"production"}
```

Access the application:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api

### 5. Production Commands

```bash
# View logs
docker-compose logs -f server
docker-compose logs -f client

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update deployment
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U postgres onboarding_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres onboarding_db
```

## Cloud Deployment

### AWS Deployment

#### Option 1: EC2 with Docker

```bash
# 1. Launch EC2 instance (Ubuntu 22.04 LTS)
# 2. Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER

# 3. Clone repository
git clone <repository-url>
cd onboarding-alchemy-platform

# 4. Set up environment
cp server/.env.example server/.env
# Edit server/.env with production values

# 5. Deploy
docker compose up -d
```

#### Option 2: ECS (Elastic Container Service)

1. **Build and push images to ECR**:
```bash
# Create ECR repositories
aws ecr create-repository --repository-name onboarding/server
aws ecr create-repository --repository-name onboarding/client

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push server
docker build -t onboarding/server ./server
docker tag onboarding/server:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/onboarding/server:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/onboarding/server:latest

# Build and push client
docker build --build-arg VITE_API_URL=https://api.yourdomain.com/api -t onboarding/client ./client
docker tag onboarding/client:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/onboarding/client:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/onboarding/client:latest
```

2. **Create ECS task definitions and services** using AWS Console or CLI

3. **Set up RDS PostgreSQL** for the database

4. **Configure Application Load Balancer** for routing

5. **Set up Route 53** for DNS

#### Option 3: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init -p docker onboarding-platform

# Create environment
eb create onboarding-prod

# Deploy
eb deploy

# Open in browser
eb open
```

### Google Cloud Deployment

#### Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/onboarding-server ./server
gcloud builds submit --tag gcr.io/PROJECT_ID/onboarding-client ./client

# Deploy server
gcloud run deploy onboarding-server \
  --image gcr.io/PROJECT_ID/onboarding-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="..." \
  --set-env-vars JWT_SECRET="..."

# Deploy client
gcloud run deploy onboarding-client \
  --image gcr.io/PROJECT_ID/onboarding-client \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### Azure Container Apps

```bash
# Create resource group
az group create --name onboarding-rg --location eastus

# Create Container Apps environment
az containerapp env create \
  --name onboarding-env \
  --resource-group onboarding-rg \
  --location eastus

# Create PostgreSQL
az postgres flexible-server create \
  --name onboarding-db \
  --resource-group onboarding-rg \
  --location eastus \
  --admin-user postgres \
  --admin-password <strong-password>

# Deploy server
az containerapp create \
  --name onboarding-server \
  --resource-group onboarding-rg \
  --environment onboarding-env \
  --image <registry>/onboarding-server:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars "DATABASE_URL=..." "JWT_SECRET=..."

# Deploy client
az containerapp create \
  --name onboarding-client \
  --resource-group onboarding-rg \
  --environment onboarding-env \
  --image <registry>/onboarding-client:latest \
  --target-port 80 \
  --ingress external
```

### DigitalOcean Deployment

#### App Platform

1. **Connect your repository** to DigitalOcean App Platform
2. **Configure build settings**:
   - Server: Dockerfile path = `server/Dockerfile`
   - Client: Dockerfile path = `client/Dockerfile`
3. **Set environment variables** in the App Platform console
4. **Add PostgreSQL database** from DigitalOcean Managed Databases
5. **Deploy** and get your app URL

## Environment Variables

### Required Variables

```bash
# Server
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<min-32-character-random-string>

# Client
VITE_API_URL=https://api.yourdomain.com/api
```

### Optional Variables

```bash
# Email
SENDGRID_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Company

# AI Features
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT_NAME=

# Cloud Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# Caching
REDIS_URL=redis://localhost:6379
```

### Generating Secrets

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

## Database Migration

### Initial Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply migrations in production
npx prisma migrate deploy
```

### Backup and Restore

```bash
# Backup
pg_dump -h localhost -U postgres -d onboarding_db > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U postgres -d onboarding_db < backup_20240101.sql
```

## Monitoring & Logging

### Application Logs

```bash
# View logs
docker-compose logs -f server

# Logs are also written to ./server/logs/
tail -f server/logs/combined-*.log
tail -f server/logs/error-*.log
```

### Health Checks

```bash
# Application health
curl https://api.yourdomain.com/health

# Database health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

### Monitoring Services

Recommended monitoring tools:
- **Application Monitoring**: Datadog, New Relic, or Sentry
- **Uptime Monitoring**: UptimeRobot or Pingdom
- **Log Management**: Loggly, Papertrail, or ELK Stack

## Backup & Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup database
docker-compose exec -T postgres pg_dump -U postgres onboarding_db > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" server/uploads

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Disaster Recovery

```bash
# 1. Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres onboarding_db

# 2. Restore uploads
tar -xzf uploads_backup.tar.gz -C server/

# 3. Restart services
docker-compose restart
```

## Troubleshooting

### Common Issues

#### Container won't start

```bash
# Check logs
docker-compose logs server

# Check container status
docker-compose ps

# Rebuild container
docker-compose build server
docker-compose up -d server
```

#### Database connection errors

```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec server node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected')).catch(e => console.error(e))"

# Check DATABASE_URL format
echo $DATABASE_URL
```

#### Email not sending

```bash
# Check SMTP settings
docker-compose exec server node -e "console.log(process.env.SMTP_HOST, process.env.SMTP_USER)"

# Test with MailDev in development
# View emails at http://localhost:1080
```

#### File uploads failing

```bash
# Check uploads directory permissions
ls -la server/uploads

# Create if doesn't exist
mkdir -p server/uploads
chmod 755 server/uploads
```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_hr_id ON employees(hr_id);
CREATE INDEX idx_meetings_employee_id ON meetings(employee_id);
```

#### Caching

Enable Redis caching:

```bash
# Add to docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"

# Set REDIS_URL in environment
REDIS_URL=redis://redis:6379
```

## Security Checklist

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (use Nginx or cloud load balancer)
- [ ] Set secure CORS_ORIGIN
- [ ] Use managed database with backups
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Enable container scanning
- [ ] Set up Web Application Firewall (WAF)
- [ ] Implement log monitoring and alerts

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check database connectivity
4. Review [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
5. Open an issue with deployment details

---

**Last Updated**: November 2024
**Version**: 1.0.0
