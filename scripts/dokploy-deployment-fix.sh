#!/bin/bash

# Dokploy Deployment Fix Script
# This script helps diagnose and fix common deployment issues

set -e

echo "🔍 BlytzWork Dokploy Deployment Fix Script"
echo "=========================================="

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
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
print_status "Checking project structure..."
if [ ! -f "docker-compose.consolidated.yml" ]; then
    print_error "docker-compose.consolidated.yml not found in current directory"
    exit 1
fi

if [ ! -f "docker-compose.consolidated.fixed.yml" ]; then
    print_error "docker-compose.consolidated.fixed.yml not found in current directory"
    exit 1
fi

print_status "Project structure looks good!"

# Check Docker and Docker Compose
print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker and Docker Compose are installed!"

# Check for existing containers
print_status "Checking for existing containers..."
if docker ps -a | grep -q "blytzwork"; then
    print_warning "Found existing BlytzWork containers"
    read -p "Do you want to stop and remove them? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing existing containers..."
        docker-compose -f docker-compose.consolidated.yml down -v 2>/dev/null || true
        docker-compose -f docker-compose.consolidated.fixed.yml down -v 2>/dev/null || true
        docker stop $(docker ps -aq --filter name=blytzwork) 2>/dev/null || true
        docker rm $(docker ps -aq --filter name=blytzwork) 2>/dev/null || true
    fi
fi

# Check for dokploy-network
print_status "Checking for dokploy-network..."
if ! docker network ls | grep -q "dokploy-network"; then
    print_warning "dokploy-network not found"
    read -p "Do you want to create it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Creating dokploy-network..."
        docker network create dokploy-network
    fi
fi

# Check environment file
print_status "Checking for .env file..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    if [ -f ".env.example" ]; then
        read -p "Do you want to create .env from .env.example? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            print_status "Created .env from .env.example"
            print_warning "Please update the .env file with your actual values before deploying"
        fi
    fi
else
    print_status ".env file found"
fi

# Test Docker Compose file syntax
print_status "Testing Docker Compose file syntax..."
if docker-compose -f docker-compose.consolidated.fixed.yml config > /dev/null 2>&1; then
    print_status "docker-compose.consolidated.fixed.yml syntax is valid!"
else
    print_error "docker-compose.consolidated.fixed.yml has syntax errors"
    docker-compose -f docker-compose.consolidated.fixed.yml config
    exit 1
fi

# Deployment options
echo ""
echo "🚀 Deployment Options:"
echo "1. Use fixed compose file (recommended for Dokploy)"
echo "2. Use original compose file (requires dokploy-network)"
echo "3. Use minimal compose file"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " -n 1 -r
echo
case $REPLY in
    1)
        print_status "Deploying with docker-compose.consolidated.fixed.yml..."
        docker-compose -f docker-compose.consolidated.fixed.yml up -d --build
        print_status "Deployment initiated!"
        ;;
    2)
        print_status "Deploying with docker-compose.consolidated.yml..."
        docker-compose -f docker-compose.consolidated.yml up -d --build
        print_status "Deployment initiated!"
        ;;
    3)
        if [ -f "docker-compose.minimal.yml" ]; then
            print_status "Deploying with docker-compose.minimal.yml..."
            docker-compose -f docker-compose.minimal.yml up -d --build
            print_status "Deployment initiated!"
        else
            print_error "docker-compose.minimal.yml not found"
            exit 1
        fi
        ;;
    4)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Wait for containers to start
print_status "Waiting for containers to start..."
sleep 10

# Check container status
print_status "Checking container status..."
docker-compose -f docker-compose.consolidated.fixed.yml ps

# Check health
print_status "Checking service health..."
sleep 20

echo ""
print_status "Health Check Results:"
echo "=========================="

# Backend health
if docker-compose -f docker-compose.consolidated.fixed.yml exec -T blytzwork-backend curl -f http://localhost:3000/health 2>/dev/null; then
    print_status "✅ Backend is healthy"
else
    print_warning "⚠️  Backend health check failed"
fi

# Frontend health
if docker-compose -f docker-compose.consolidated.fixed.yml exec -T blytzwork-frontend curl -f http://localhost:3001/ 2>/dev/null; then
    print_status "✅ Frontend is healthy"
else
    print_warning "⚠️  Frontend health check failed"
fi

# Database health
if docker-compose -f docker-compose.consolidated.fixed.yml exec -T postgres pg_isready -U postgres -d blytzwork 2>/dev/null; then
    print_status "✅ Database is healthy"
else
    print_warning "⚠️  Database health check failed"
fi

# Redis health
if docker-compose -f docker-compose.consolidated.fixed.yml exec -T redis redis-cli ping 2>/dev/null; then
    print_status "✅ Redis is healthy"
else
    print_warning "⚠️  Redis health check failed"
fi

echo ""
print_status "Deployment fix script completed!"
echo ""
echo "Next steps:"
echo "1. Update your Dokploy configuration to use docker-compose.consolidated.fixed.yml"
echo "2. Ensure all environment variables are set correctly in Dokploy"
echo "3. Check the application logs for any remaining issues"
echo ""
echo "To view logs:"
echo "docker-compose -f docker-compose.consolidated.fixed.yml logs blytzwork-backend"
echo "docker-compose -f docker-compose.consolidated.fixed.yml logs blytzwork-frontend"