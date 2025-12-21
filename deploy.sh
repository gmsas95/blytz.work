#!/bin/bash

# BlytzWork Platform Deployment Script
# This script deploys the BlytzWork platform using the correct service names
# Project name: blytzwork-webapp-uvey24

set -e

echo "🚀 Starting BlytzWork Platform Deployment..."
echo "Project: blytzwork-webapp-uvey24"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found in current directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ Warning: .env file not found. Using environment variables from system."
fi

echo "📋 Deployment Configuration:"
echo "- Compose File: docker-compose.yml"
echo "- Project Name: blytzwork-webapp-uvey24"
echo "- Services: blytzwork-backend, blytzwork-frontend, postgres, redis"
echo ""

# Stop any existing containers for this project
echo "🛑 Stopping any existing containers..."
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml down --remove-orphans 2>/dev/null || true

# Build and start the services
echo "🔨 Building and starting services..."
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml up -d --build --remove-orphans

echo ""
echo "✅ Deployment initiated successfully!"
echo ""

# Wait a moment for containers to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml ps

echo ""
echo "🔍 Service Health Checks:"
echo ""

# Check backend health
echo "Checking backend health..."
if docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec -T blytzwork-backend curl -f http://localhost:3000/health 2>/dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend health
echo "Checking frontend health..."
if docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec -T blytzwork-frontend curl -f http://localhost:3001/ 2>/dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check database health
echo "Checking database health..."
if docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec -T postgres pg_isready -U postgres -d blytzwork 2>/dev/null; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
fi

# Check Redis health
echo "Checking Redis health..."
if docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml exec -T redis redis-cli ping 2>/dev/null; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📝 Useful Commands:"
echo "- View logs: docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml logs -f"
echo "- Stop services: docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml down"
echo "- Restart services: docker compose -p blytzwork-webapp-uvey24 -f ./docker-compose.yml restart"
echo ""
echo "🌐 Access URLs:"
echo "- Frontend: https://blytz.work"
echo "- Backend API: https://gateway.blytz.work"
echo ""