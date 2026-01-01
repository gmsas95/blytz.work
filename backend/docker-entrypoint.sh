#!/bin/sh
set -e

echo "🔄 Starting backend with database setup..."

# Run database check script
node /app/check-db.js
DB_CHECK_RESULT=$?

if [ "$DB_CHECK_RESULT" != "0" ]; then
  echo "❌ Database setup failed!"
  exit 1
fi

echo "✅ Database ready, starting server..."
exec npm start
