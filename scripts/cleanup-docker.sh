#!/bin/bash

# Docker Cleanup Script for BlytzWork Platform
# This script removes all cached Docker state to ensure clean deployment
# Use this before redeploying to avoid conflicts with old service names

set -e

echo "🧹 Docker Cleanup Script for BlytzWork Platform"
echo "=============================================="
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

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_warning "This script may require sudo privileges for some operations."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_status "Starting Docker cleanup process..."

# Stop and remove all containers related to the project
print_status "Stopping and removing BlytzWork containers..."
docker stop blytzwork-frontend blytzwork-backend blytzwork-postgres blytzwork-redis 2>/dev/null || true
docker rm blytzwork-frontend blytzwork-backend blytzwork-postgres blytzwork-redis 2>/dev/null || true

# Stop and remove any containers with old names (if they exist)
print_status "Removing containers with old service names..."
docker stop frontend-final backend-final 2>/dev/null || true
docker rm frontend-final backend-final 2>/dev/null || true

# Remove any containers from the docker-compose project
print_status "Removing containers from docker-compose project..."
docker compose -p blytzwork-webapp-uvey24 down --remove-orphans 2>/dev/null || true
docker compose -p blytzwork down --remove-orphans 2>/dev/null || true

# Remove all unused containers
print_status "Removing all unused containers..."
docker container prune -f

# Remove all unused images
print_status "Removing unused Docker images..."
docker image prune -a -f

# Remove all unused volumes (be careful with this)
print_warning "The following command will remove ALL unused volumes."
print_warning "This includes data from containers not currently running."
read -p "Do you want to remove unused volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing unused volumes..."
    docker volume prune -f
else
    print_status "Skipping volume cleanup."
fi

# Remove all unused networks
print_status "Removing unused networks..."
docker network prune -f

# Clean build cache
print_status "Cleaning Docker build cache..."
docker builder prune -a -f

# Remove specific project-related images if they exist
print_status "Removing project-specific images..."
docker rmi blytzwork-frontend blytzwork-backend 2>/dev/null || true

# Check if dokploy-network exists and recreate it if needed
if docker network ls | grep -q "dokploy-network"; then
    print_status "dokploy-network already exists."
else
    print_status "Creating dokploy-network..."
    docker network create dokploy-network
fi

# Final system cleanup
print_status "Performing final system cleanup..."
docker system prune -a -f

print_success "Docker cleanup completed successfully!"
echo ""
print_status "Docker is now in a clean state. You can now run the deployment with:"
echo "  docker compose -f docker-compose.dokploy.yml -p blytzwork-webapp-uvey24 up -d --build"
echo ""
print_status "To verify the cleanup, you can run:"
echo "  docker system df"
echo "  docker ps -a"
echo ""
print_success "Ready for clean deployment!"