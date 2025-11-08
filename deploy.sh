#!/bin/bash

# Dokploy Deployment Script for Blytz-Hire Backend
# This script prepares and deploys the backend to Dokploy

set -e

echo "🚀 Starting Blytz-Hire Backend Deployment to Dokploy"

# Check if we have the required environment variables
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "FIREBASE_PROJECT_ID" "FIREBASE_CLIENT_EMAIL" "FIREBASE_PRIVATE_KEY" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET")

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        echo "❌ Error: Required environment variable $var is missing from .env"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Test local build first
echo "🔨 Testing local Docker build..."
docker compose -f docker-compose.backend.yml build

if [ $? -eq 0 ]; then
    echo "✅ Local Docker build successful"
else
    echo "❌ Local Docker build failed"
    exit 1
fi

# Clean up local containers
echo "🧹 Cleaning up local containers..."
docker compose -f docker-compose.backend.yml down -v

echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next Steps for Dokploy Deployment:"
echo "1. Push latest changes to GitHub (done)"
echo "2. In Dokploy, create a new application"
echo "3. Connect your GitHub repository"
echo "4. Set the root path to: ./backend"
echo "5. Use the following Docker Compose file: docker-compose.backend.yml"
echo "6. Add your environment variables in Dokploy dashboard"
echo "7. Deploy! 🚀"
echo ""
echo "🔗 Health endpoint will be available at: http://your-domain.com/health"