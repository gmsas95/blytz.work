#!/bin/sh

echo "🔄 Starting backend with database setup..."

# Run database check script (may exit with 1 if no tables)
if node /app/check-db.js; then
  echo "✅ Tables exist, skipping migrations"
else
  DB_CHECK_RESULT=$?
  if [ "$DB_CHECK_RESULT" = "1" ]; then
    echo "⚠️  No tables found, running migrations..."
    npx prisma migrate deploy || echo "⚠️  Migration failed, starting anyway..."
    echo "✅ Migration check complete"
  else
    echo "❌ Database check failed with code $DB_CHECK_RESULT"
    exit $DB_CHECK_RESULT
  fi
fi

echo "✅ Database ready, starting server..."
exec npm start
