#!/bin/bash
# Reset PostgreSQL database volume for fresh start

set -e

echo "🗑️  Resetting PostgreSQL database..."

# Stop containers
echo "🛑 Stopping containers..."
docker compose -f docker-compose.dokploy-ready.yml down

# Remove the database volume
echo "🗑️  Removing postgres_data volume..."
docker volume rm blytzwork_postgres_data 2>/dev/null || echo "Volume doesn't exist or already removed"

# Restart containers
echo "🚀 Starting containers with fresh database..."
docker compose -f docker-compose.dokploy-ready.yml up -d

echo "✅ Database reset complete!"