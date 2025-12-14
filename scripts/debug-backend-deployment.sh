#!/bin/bash

# Backend Deployment Debug Script
# This script helps diagnose why the backend container is becoming unhealthy

set -e

echo "🔍 Backend Deployment Debug Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.6-debug.yml" ]; then
    print_error "docker-compose.6-debug.yml not found. Please run from the project root."
    exit 1
fi

# Step 1: Build the debug version
print_header "Step 1: Building debug backend image..."
cd backend
npm run build:debug
cd ..
print_status "Debug backend built successfully"

# Step 2: Start infrastructure services
print_header "Step 2: Starting infrastructure services..."
docker-compose -f docker-compose.6-debug.yml up -d postgres redis

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
for i in {1..30}; do
    if docker-compose -f docker-compose.6-debug.yml ps postgres | grep -q "healthy"; then
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Step 3: Run diagnostic container
print_header "Step 3: Running diagnostic container..."
docker-compose -f docker-compose.6-debug.yml --profile diagnostic up --build backend-diagnostic

# Step 4: Start backend debug container
print_header "Step 4: Starting backend debug container..."
docker-compose -f docker-compose.6-debug.yml up -d backend-debug

# Step 5: Show container logs
print_header "Step 5: Showing backend container logs..."
echo ""
echo "=== Backend Container Logs ==="
docker-compose -f docker-compose.6-debug.yml logs --tail=50 backend-debug

# Step 6: Check container status
print_header "Step 6: Checking container status..."
echo ""
echo "=== Container Status ==="
docker-compose -f docker-compose.6-debug.yml ps

# Step 7: Test health endpoint manually
print_header "Step 7: Testing health endpoint manually..."
sleep 10  # Give server time to start
echo ""
echo "=== Health Endpoint Test ==="
if curl -f http://localhost:3010/health 2>/dev/null; then
    print_status "Health endpoint is responding correctly"
else
    print_error "Health endpoint is not responding"
    echo "Trying with curl -v for more details:"
    curl -v http://localhost:3010/health || true
fi

# Step 8: Show environment variables
print_header "Step 8: Showing environment variables in container..."
echo ""
echo "=== Environment Variables ==="
docker-compose -f docker-compose.6-debug.yml exec backend-debug env | grep -E "(FIREBASE|DATABASE|JWT|NODE_ENV|PORT)" || true

# Step 9: Cleanup
print_header "Step 9: Cleanup..."
echo ""
echo "Stopping debug containers..."
docker-compose -f docker-compose.6-debug.yml down

echo ""
print_status "Debug script completed!"
echo ""
echo "📊 Summary:"
echo "=========="
echo "- Check the container logs above for any error messages"
echo "- Verify environment variables are correctly set"
echo "- Check if database connection is successful"
echo "- Verify Firebase initialization status"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. If database connection fails: Check DATABASE_URL and PostgreSQL status"
echo "2. If Firebase fails: Add missing FIREBASE_* environment variables"
echo "3. If server fails to start: Check for port conflicts or binding issues"
echo "4. If health check fails: Verify the /health endpoint is accessible"
echo ""
echo "To run this script again: ./scripts/debug-backend-deployment.sh"