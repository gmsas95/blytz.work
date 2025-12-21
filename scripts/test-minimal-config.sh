#!/bin/bash

# Test script for minimal Docker Compose configuration
# Verifies that the configuration resolves 503 Service Unavailable errors

echo "🧪 Testing Minimal Docker Compose Configuration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found!"
    exit 1
fi

print_status "Found docker-compose.yml"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Using default values."
    print_warning "For production, ensure .env contains all required variables."
fi

# Test 1: Validate Docker Compose configuration
print_status "Test 1: Validating Docker Compose configuration..."
if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
    print_status "✅ Docker Compose configuration is valid"
else
    print_error "❌ Docker Compose configuration has errors"
    docker-compose -f docker-compose.yml config
    exit 1
fi

# Test 2: Check if required ports are available
print_status "Test 2: Checking port availability..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "⚠️  Port $port is already in use"
        return 1
    else
        print_status "✅ Port $port is available"
        return 0
    fi
}

check_port 3001  # Frontend
check_port 3002  # Backend
check_port 5432  # PostgreSQL
check_port 6379  # Redis

# Test 3: Start services and check health
print_status "Test 3: Starting services..."

# Stop any existing containers from this compose file
docker-compose -f docker-compose.yml down -v 2>/dev/null

# Start services
docker-compose -f docker-compose.yml up -d

# Wait for services to start
print_status "Waiting for services to start (60 seconds)..."
sleep 60

# Test 4: Check service health
print_status "Test 4: Checking service health..."

# Function to check container health
check_container_health() {
    local container_name=$1
    local health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)
    
    if [ "$health" == "healthy" ]; then
        print_status "✅ $container_name is healthy"
        return 0
    elif [ "$health" == "unhealthy" ]; then
        print_error "❌ $container_name is unhealthy"
        return 1
    elif [ "$health" == "starting" ]; then
        print_warning "⚠️  $container_name is still starting"
        return 2
    else
        print_warning "⚠️  $container_name has no health check or is not running"
        return 3
    fi
}

# Check each container
check_container_health "blytzwork-postgres"
check_container_health "blytzwork-redis"
check_container_health "blytzwork-backend"
check_container_health "blytzwork-frontend"

# Test 5: Test service connectivity
print_status "Test 5: Testing service connectivity..."

# Test backend health endpoint
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    print_status "✅ Backend health endpoint is accessible"
else
    print_error "❌ Backend health endpoint is not accessible"
fi

# Test frontend
if curl -f http://localhost:3001/ > /dev/null 2>&1; then
    print_status "✅ Frontend is accessible"
else
    print_error "❌ Frontend is not accessible"
fi

# Test 6: Test inter-container communication
print_status "Test 6: Testing inter-container communication..."

# Test if frontend can reach backend
if docker exec blytzwork-frontend curl -f http://blytzwork-backend:3000/health > /dev/null 2>&1; then
    print_status "✅ Frontend can communicate with backend"
else
    print_error "❌ Frontend cannot communicate with backend"
fi

# Test 7: Check logs for errors
print_status "Test 7: Checking for errors in logs..."

# Function to check for errors in container logs
check_logs_for_errors() {
    local container_name=$1
    local error_count=$(docker logs $container_name 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    
    if [ $error_count -gt 0 ]; then
        print_warning "⚠️  Found $error_count potential error(s) in $container_name logs"
        print_warning "Check with: docker logs $container_name"
    else
        print_status "✅ No obvious errors in $container_name logs"
    fi
}

check_logs_for_errors "blytzwork-postgres"
check_logs_for_errors "blytzwork-redis"
check_logs_for_errors "blytzwork-backend"
check_logs_for_errors "blytzwork-frontend"

# Test 8: Network connectivity test
print_status "Test 8: Testing network configuration..."

# Check if containers are on the same network
backend_network=$(docker inspect blytzwork-backend --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' 2>/dev/null)
frontend_network=$(docker inspect blytzwork-frontend --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' 2>/dev/null)

if [ "$backend_network" == "$frontend_network" ] && [ -n "$backend_network" ]; then
    print_status "✅ Backend and Frontend are on the same network"
else
    print_error "❌ Backend and Frontend are on different networks"
fi

# Summary
print_status "=============================================="
print_status "Test Summary Complete"
print_status ""
print_status "To view service status: docker-compose -f docker-compose.yml ps"
print_status "To view logs: docker-compose -f docker-compose.yml logs -f"
print_status "To stop services: docker-compose -f docker-compose.yml down"
print_status ""
print_status "If all tests passed, the minimal configuration should resolve 503 errors."
print_status "=============================================="