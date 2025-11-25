#!/bin/bash

# Deployment script for Onboarding Alchemy Platform
# Usage: ./deploy.sh [environment]
# environment: local, dev, staging, production

set -e

ENVIRONMENT=${1:-local}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Onboarding Alchemy Platform - Deployment Script         ║${NC}"
echo -e "${GREEN}║  Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print messages
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}!${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

log_info "Docker is installed"

# Function to check if .env exists
check_env_file() {
    if [ ! -f ".env" ] && [ "$ENVIRONMENT" = "production" ]; then
        log_warn ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_warn "Please edit .env file with your production values before continuing."
        read -p "Press Enter after updating .env file..."
    fi
}

# Function to deploy local environment
deploy_local() {
    log_info "Deploying to local environment..."
    
    # Start development services
    log_info "Starting PostgreSQL, Redis, and MailDev..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 5
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Setup database
    log_info "Setting up database..."
    cd server
    npm run db:generate
    npm run db:push
    npm run db:seed
    cd ..
    
    log_info "Local environment is ready!"
    log_info "Run 'npm run dev' to start the application"
    echo ""
    echo "Services running:"
    echo "  - PostgreSQL: localhost:5433"
    echo "  - Redis: localhost:6380"
    echo "  - MailDev UI: http://localhost:1080"
}

# Function to deploy development environment
deploy_dev() {
    log_info "Deploying to development environment..."
    
    check_env_file
    
    # Build and start services
    log_info "Building Docker images..."
    docker-compose build
    
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for database
    log_info "Waiting for database..."
    sleep 10
    
    # Run migrations
    log_info "Running database migrations..."
    docker-compose exec -T server npx prisma migrate deploy
    
    log_info "Development environment deployed successfully!"
    log_info "Access the application at:"
    log_info "  Frontend: http://localhost:3001"
    log_info "  Backend: http://localhost:3000/api"
}

# Function to deploy staging environment
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    check_env_file
    
    # Pull latest code
    log_info "Pulling latest code..."
    git pull origin staging || log_warn "Failed to pull from staging branch"
    
    # Build and deploy
    deploy_dev
}

# Function to deploy production environment
deploy_production() {
    log_warn "Deploying to PRODUCTION environment..."
    read -p "Are you sure you want to deploy to production? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_error "Deployment cancelled."
        exit 1
    fi
    
    check_env_file
    
    # Pull latest code
    log_info "Pulling latest code..."
    git pull origin main || log_error "Failed to pull from main branch"
    
    # Backup database
    log_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker-compose exec -T postgres pg_dump -U postgres onboarding_db > "backup_${timestamp}.sql" || log_warn "Backup failed"
    
    # Build images
    log_info "Building production images..."
    docker-compose build --no-cache
    
    # Stop services
    log_info "Stopping services..."
    docker-compose down
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for database
    log_info "Waiting for services..."
    sleep 15
    
    # Run migrations
    log_info "Running database migrations..."
    docker-compose exec -T server npx prisma migrate deploy
    
    # Health check
    log_info "Performing health check..."
    sleep 5
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_info "Health check passed!"
    else
        log_error "Health check failed!"
        log_error "Rolling back..."
        docker-compose down
        docker-compose up -d
        exit 1
    fi
    
    log_info "Production deployment completed successfully!"
    log_info "Backup saved to: backup_${timestamp}.sql"
}

# Function to rollback
rollback() {
    log_warn "Rolling back deployment..."
    
    if [ -z "$1" ]; then
        log_error "Please specify backup file: ./deploy.sh rollback backup_YYYYMMDD_HHMMSS.sql"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        log_error "Backup file $1 not found"
        exit 1
    fi
    
    log_info "Restoring database from $1..."
    cat "$1" | docker-compose exec -T postgres psql -U postgres onboarding_db
    
    log_info "Restarting services..."
    docker-compose restart
    
    log_info "Rollback completed"
}

# Main deployment logic
case "$ENVIRONMENT" in
    local)
        deploy_local
        ;;
    dev)
        deploy_dev
        ;;
    staging)
        deploy_staging
        ;;
    production|prod)
        deploy_production
        ;;
    rollback)
        rollback "$2"
        ;;
    *)
        log_error "Unknown environment: $ENVIRONMENT"
        echo "Usage: ./deploy.sh [local|dev|staging|production|rollback]"
        exit 1
        ;;
esac

echo ""
log_info "Deployment completed!"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Health check:  curl http://localhost:3000/health"
echo ""
