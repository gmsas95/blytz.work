#!/bin/sh
set -e

echo "🔄 Starting backend with database migration..."

# Run Prisma migrations
echo "📦 Applying database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  echo "❌ Migration failed, trying db push as fallback..."
  # Fallback to db push if migrate fails
  npx prisma db push --accept-data-loss || {
    echo "❌ Database push also failed!"
    echo "🚨 Tables may not exist. Please check logs above."
  }
fi

echo "✅ Database setup complete, starting server..."
exec npm start
