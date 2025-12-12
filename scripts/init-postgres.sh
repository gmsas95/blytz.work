#!/bin/bash
# PostgreSQL initialization script for existing database
# This script ensures the blytz_user exists when database directory already exists

set -e

echo "🔧 PostgreSQL initialization script running..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
while ! pg_isready -U postgres; do
  sleep 1
done

echo "✅ PostgreSQL is ready"

# Create user if it doesn't exist
echo "👤 Creating user ${POSTGRES_USER:-blytz_user} if it doesn't exist..."
psql -U postgres -d postgres -c "CREATE USER ${POSTGRES_USER:-blytz_user} WITH SUPERUSER PASSWORD '${POSTGRES_PASSWORD:-z46fkjvmqzf7z2woihbvo9hr2yloopac}';" || echo "User already exists"

# Create database if it doesn't exist
echo "🗄️ Creating database ${POSTGRES_DB:-blytz_work} if it doesn't exist..."
psql -U postgres -d postgres -c "CREATE DATABASE ${POSTGRES_DB:-blytz_work} OWNER ${POSTGRES_USER:-blytz_user};" || echo "Database already exists"

# Grant privileges
echo "🔐 Granting privileges..."
psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB:-blytz_work} TO ${POSTGRES_USER:-blytz_user};"

echo "✅ PostgreSQL initialization completed successfully"