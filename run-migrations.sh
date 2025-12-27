#!/bin/bash

# Script to manually run Prisma migrations on production database
# This connects to the production backend container and runs migrations

set -e

echo "🗄️ Running Prisma migrations on production database..."

# Get the project name from docker-compose
PROJECT_NAME="blytzwork-webapp-uvey24"

# Check if backend container is running
echo "🔍 Checking if backend container is running..."
if ! docker ps --filter "name=blytzwork-backend" --format "{{.Names}}" | grep -q blytzwork-backend; then
    echo "❌ Backend container not found. Is it running?"
    echo "Run: docker compose -p $PROJECT_NAME -f ./docker-compose.yml ps"
    exit 1
fi

echo "✅ Backend container found"

# Check if DATABASE_URL is set in the container
echo "🔍 Checking DATABASE_URL in backend container..."
if docker exec blytzwork-backend printenv DATABASE_URL > /dev/null 2>&1; then
    DB_URL=$(docker exec blytzwork-backend printenv DATABASE_URL)
    echo "✅ DATABASE_URL is set: ${DB_URL%%:*}://***:***@${DB_URL##*@}"
else
    echo "⚠️  DATABASE_URL not set in container"
    exit 1
fi

# Run Prisma migrations
echo "🚀 Running Prisma migrations..."
docker exec -T blytzwork-backend npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

# Verify tables were created
echo "🔍 Verifying database tables..."
TABLES=$(docker exec -T blytzwork-backend npx prisma db execute --stdin <<'SQL'
SELECT COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SQL
)

if [ $? -eq 0 ]; then
    echo "✅ Database verification complete"
    echo "📊 Total tables in database: $TABLES"
else
    echo "⚠️  Could not verify tables"
fi

echo ""
echo "🎉 Database migration process complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test the VA onboarding page at https://blytz.work/va/onboarding"
echo "2. Monitor backend logs: docker logs -f blytzwork-backend"
