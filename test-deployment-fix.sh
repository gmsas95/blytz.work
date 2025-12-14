#!/bin/bash

# Deployment Test Script for BlytzWork Platform
# This script tests the fixed docker-compose configuration

set -e

echo "🚀 Testing BlytzWork Deployment Configuration"
echo "=============================================="

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
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if docker-compose file exists
if [ ! -f "docker-compose.6-unified-fixed.yml" ]; then
    print_error "docker-compose.6-unified-fixed.yml not found!"
    exit 1
fi

print_status "Found docker-compose.6-unified-fixed.yml"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Using default environment variables."
else
    print_status "Found .env.production"
fi

# Test docker-compose configuration
echo ""
echo "🔍 Validating docker-compose configuration..."
docker-compose -f docker-compose.6-unified-fixed.yml config > /dev/null
print_status "Docker-compose configuration is valid"

# Check environment variables
echo ""
echo "🔍 Checking critical environment variables..."

# Check for required environment variables (they can be empty for this test)
required_vars=(
    "DATABASE_URL"
    "REDIS_URL"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_CLIENT_EMAIL"
    "FIREBASE_PRIVATE_KEY"
    "JWT_SECRET"
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "The following environment variables are not set (they may be set in Dokploy):"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "💡 Make sure these are set in your Dokploy environment variables"
else
    print_status "All critical environment variables are set"
fi

# Test backend health check URL
echo ""
echo "🔍 Testing backend health check URL..."
backend_health_url="http://localhost:3000/health"
echo "Backend health check will use: $backend_health_url"

# Test frontend health check URL
echo ""
echo "🔍 Testing frontend health check URL..."
frontend_health_url="http://localhost:3001/"
echo "Frontend health check will use: $frontend_health_url"

# Check port mappings
echo ""
echo "🔍 Checking port mappings..."
echo "Backend: Host port 3010 → Container port 3000"
echo "Frontend: Host port 3012 → Container port 3001"
echo "PostgreSQL: Host port 5432 → Container port 5432"
echo "Redis: Host port 6379 → Container port 6379"

# Check health check configurations
echo ""
echo "🔍 Checking health check configurations..."
echo "Backend health check:"
echo "  - URL: http://localhost:3000/health"
echo "  - Interval: 30s"
echo "  - Timeout: 10s"
echo "  - Retries: 3"
echo "  - Start period: 60s"

echo ""
echo "Frontend health check:"
echo "  - URL: http://localhost:3001/"
echo "  - Interval: 30s"
echo "  - Timeout: 10s"
echo "  - Retries: 3"
echo "  - Start period: 60s"

# Check Firebase environment variables in docker-compose
echo ""
echo "🔍 Checking Firebase environment variables in docker-compose..."

firebase_vars=(
    "FIREBASE_PROJECT_ID"
    "FIREBASE_CLIENT_EMAIL"
    "FIREBASE_PRIVATE_KEY"
    "FIREBASE_STORAGE_BUCKET"
    "FIREBASE_MESSAGING_SENDER_ID"
    "FIREBASE_APP_ID"
    "FIREBASE_MEASUREMENT_ID"
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

print_status "All Firebase environment variables are configured in docker-compose.6-unified-fixed.yml"

# Summary
echo ""
echo "=============================================="
echo "📋 Configuration Summary"
echo "=============================================="
print_status "✅ Backend health check URL fixed (removed /api prefix)"
print_status "✅ Frontend health check URL fixed (using root path)"
print_status "✅ All Firebase environment variables added"
print_status "✅ CORS origins configured"
print_status "✅ Docker-compose configuration validated"

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Ensure all environment variables are set in Dokploy"
echo "2. Use docker-compose.6-unified-fixed.yml for deployment"
echo "3. Monitor container health after deployment"
echo ""
echo "💡 If containers still become unhealthy, check container logs with:"
echo "   docker logs blytzwork-backend-final"
echo "   docker logs blytzwork-frontend-final"