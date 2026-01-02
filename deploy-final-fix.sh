#!/bin/bash

# Final Deployment Fix Script
# This script uses the fixed docker-compose.6-unified-fixed.yml file
# that addresses all the issues causing unhealthy containers

set -e

echo "🚀 Starting Final Deployment Fix for BlytzWork Platform"
echo "========================================================"

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

# Check if we're in the right directory
if [ ! -f "docker-compose.6-unified-fixed.yml" ]; then
    print_error "docker-compose.6-unified-fixed.yml not found in current directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if dokploy network exists
if ! docker network ls | grep -q "dokploy-network"; then
    print_warning "dokploy-network not found. Creating it..."
    docker network create dokploy-network
    print_success "dokploy-network created"
fi

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.6-unified-fixed.yml down --remove-orphans || true

# Remove old images to ensure fresh build
print_status "Removing old images..."
docker rmi blytzwork-backend-final:latest || true
docker rmi blytzwork-frontend-final:latest || true

# Build and start services
print_status "Building and starting services with fixed configuration..."
docker-compose -f docker-compose.6-unified-fixed.yml up --build -d

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 30

# Check service health
print_status "Checking service health..."

# Function to check container health
check_health() {
    local container_name=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "unknown")
        
        if [ "$health" == "healthy" ]; then
            print_success "$container_name is healthy"
            return 0
        elif [ "$health" == "unhealthy" ]; then
            print_error "$container_name is unhealthy"
            return 1
        fi
        
        print_status "Checking $container_name health... (attempt $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "$container_name health check timed out"
    return 1
}

# Check each service
check_health "blytzwork-unified-postgres"
check_health "blytzwork-unified-redis"
check_health "blytzwork-backend-final"
check_health "blytzwork-frontend-final"

# Test API endpoints
print_status "Testing API endpoints..."

# Test backend health endpoint
backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health || echo "000")
if [ "$backend_health" == "200" ]; then
    print_success "Backend health endpoint is responding (HTTP $backend_health)"
else
    print_error "Backend health endpoint is not responding (HTTP $backend_health)"
fi

# Test frontend
frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3012/ || echo "000")
if [ "$frontend_health" == "200" ]; then
    print_success "Frontend is responding (HTTP $frontend_health)"
else
    print_error "Frontend is not responding (HTTP $frontend_health)"
fi

# Display container logs for debugging
print_status "Container logs for debugging:"
echo "========================="
echo "Backend logs:"
docker logs blytzwork-backend-final --tail 20
echo ""
echo "Frontend logs:"
docker logs blytzwork-frontend-final --tail 20

# Display final status
echo ""
echo "========================================================"
print_success "Final deployment fix completed!"
echo ""
echo "Services should be accessible at:"
echo "  - Frontend: http://localhost:3012"
echo "  - Backend API: http://localhost:3002"
echo "  - Database: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "To check container status: docker-compose -f docker-compose.6-unified-fixed.yml ps"
echo "To view logs: docker-compose -f docker-compose.6-unified-fixed.yml logs -f [service-name]"
echo "========================================================"