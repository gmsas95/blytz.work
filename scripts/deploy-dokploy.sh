#!/bin/bash

# Clean Deployment Script for BlytzWork Platform on Dokploy
# This script deploys the platform using the clean docker-compose.dokploy.yml file
# Project name: blytzwork-webapp-uvey24

set -e

echo "🚀 BlytzWork Platform - Clean Dokploy Deployment"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
COMPOSE_FILE="docker-compose.dokploy.yml"
PROJECT_NAME="blytzwork-webapp-uvey24"

print_status "Deployment Configuration:"
echo "- Compose File: $COMPOSE_FILE"
echo "- Project Name: $PROJECT_NAME"
echo "- Services: blytzwork-backend, blytzwork-frontend, postgres, redis"
echo ""

# Check if docker-compose.dokploy.yml exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Error: $COMPOSE_FILE not found in current directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "Warning: .env file not found. Using environment variables from system."
    print_warning "Make sure all required environment variables are set."
    echo ""
fi

# Check if dokploy-network exists
print_status "Checking for dokploy-network..."
if ! docker network ls | grep -q "dokploy-network"; then
    print_status "Creating dokploy-network..."
    docker network create dokploy-network
else
    print_success "dokploy-network already exists"
fi

# Stop any existing containers for this project
print_status "Stopping any existing containers..."
docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE down --remove-orphans 2>/dev/null || true

# Build and start the services
print_status "Building and starting services..."
docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE up -d --build --remove-orphans

echo ""
print_success "Deployment initiated successfully!"
echo ""

# Wait a moment for containers to start
print_status "Waiting for services to initialize..."
sleep 15

# Check service status
print_status "Checking service status..."
docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE ps

echo ""
print_status "Service Health Checks:"
echo ""

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_check_command=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE exec -T $service_name $health_check_command 2>/dev/null; then
            print_success "$service_name is healthy"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "$service_name health check failed after $max_attempts attempts"
            return 1
        fi
        
        print_status "Waiting for $service_name to be healthy... (Attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
}

# Check backend health
print_status "Checking backend health..."
check_service_health "blytzwork-backend" "curl -f http://localhost:3000/health"

# Check frontend health
print_status "Checking frontend health..."
check_service_health "blytzwork-frontend" "wget --no-verbose --tries=1 --spider http://0.0.0.0:3001/"

# Check database health
print_status "Checking database health..."
check_service_health "postgres" "pg_isready -U \${POSTGRES_USER:-postgres} -d \${POSTGRES_DB:-blytzwork}"

# Check Redis health
print_status "Checking Redis health..."
check_service_health "redis" "redis-cli ping"

echo ""
print_success "All services are healthy!"
echo ""

# Show logs for any services that might have issues
print_status "Recent logs (last 20 lines per service):"
docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE logs --tail=20

echo ""
print_success "Deployment completed successfully!"
echo ""
print_status "📝 Useful Commands:"
echo "- View logs: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE logs -f"
echo "- Stop services: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE down"
echo "- Restart services: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE restart"
echo "- Update services: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE up -d --build"
echo ""
print_status "🌐 Access URLs:"
echo "- Frontend: https://blytz.work"
echo "- Backend API: https://gateway.blytz.work"
echo ""
print_status "🔍 Troubleshooting:"
echo "- If services are not accessible, check Traefik configuration in dokploy.yml"
echo "- To view container logs: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE logs [service-name]"
echo "- To restart a specific service: docker compose -p $PROJECT_NAME -f ./$COMPOSE_FILE restart [service-name]"
echo ""
print_success "BlytzWork Platform is now running!"