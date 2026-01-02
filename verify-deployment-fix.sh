#!/bin/bash

# Verification script for deployment fix
# Checks that service names are consistent between docker-compose and dokploy.yml

echo "🔍 Verifying deployment fix..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Extract container names from docker-compose.dokploy-ready.yml
echo "📋 Extracting container names from docker-compose.dokploy-ready.yml..."
FRONTEND_CONTAINER=$(grep -A5 "frontend-final:" docker-compose.dokploy-ready.yml | grep "container_name:" | cut -d: -f2 | xargs)
BACKEND_CONTAINER=$(grep -A5 "backend-final:" docker-compose.dokploy-ready.yml | grep "container_name:" | cut -d: -f2 | xargs)

echo "   Frontend container: $FRONTEND_CONTAINER"
echo "   Backend container: $BACKEND_CONTAINER"
echo ""

# Extract service URLs from dokploy.yml
echo "📋 Extracting service URLs from dokploy.yml..."
FRONTEND_URL=$(grep -A5 "blytzwork-frontend-service:" dokploy.yml | grep "url:" | cut -d: -f2 | xargs)
BACKEND_URL=$(grep -A5 "blytzwork-backend-service:" dokploy.yml | grep "url:" | cut -d: -f2 | xargs)

echo "   Frontend URL: $FRONTEND_URL"
echo "   Backend URL: $BACKEND_URL"
echo ""

# Check if they match
echo "🔍 Checking consistency..."
if [[ "$FRONTEND_URL" == *"$FRONTEND_CONTAINER"* ]]; then
    print_success "Frontend service URL matches container name"
else
    print_error "Frontend service URL does not match container name"
fi

if [[ "$BACKEND_URL" == *"$BACKEND_CONTAINER"* ]]; then
    print_success "Backend service URL matches container name"
else
    print_error "Backend service URL does not match container name"
fi

echo ""
echo "🎉 Verification complete!"