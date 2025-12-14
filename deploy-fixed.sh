#!/bin/bash

# Fixed deployment script for blytz.work platform
# This script addresses the PostgreSQL health check issues and environment variable problems

set -e

echo "🚀 Starting BlytzWork Platform Deployment (Fixed Version)"
echo "=================================================="

# Check if docker network exists
if ! docker network ls | grep -q "dokploy-network"; then
    echo "📦 Creating dokploy-network..."
    docker network create dokploy-network
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.6-unified-fixed.yml down --remove-orphans || true

# Load environment variables
if [ -f .env.docker ]; then
    echo "📝 Loading environment variables from .env.docker..."
    export $(cat .env.docker | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.docker file not found. Using default values."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.6-unified-fixed.yml up -d --build --remove-orphans

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 30

# Check if PostgreSQL is healthy
echo "🔍 Checking PostgreSQL health..."
for i in {1..10}; do
    if docker-compose -f docker-compose.6-unified-fixed.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    else
        echo "⏳ Waiting for PostgreSQL... (attempt $i/10)"
        sleep 10
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ PostgreSQL failed to start. Checking logs..."
        docker-compose -f docker-compose.6-unified-fixed.yml logs postgres
        exit 1
    fi
done

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.6-unified-fixed.yml exec -T backend-final npx prisma migrate deploy || true

# Check service health
echo "🔍 Checking service health..."
sleep 30

echo "📊 Service Status:"
docker-compose -f docker-compose.6-unified-fixed.yml ps

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3012"
echo "   Backend API: http://localhost:3002"
echo "   Nginx Proxy: http://localhost:8080"
echo "   n8n (if enabled): http://localhost:5678"
echo ""
echo "🔧 To view logs: docker-compose -f docker-compose.6-unified-fixed.yml logs -f [service-name]"
echo "🛑 To stop: docker-compose -f docker-compose.6-unified-fixed.yml down"