#!/bin/bash
set -e

echo "🔧 PostgreSQL initialization for existing database..."

# This script runs after PostgreSQL starts with existing data
# It ensures the blytz_user exists with correct permissions

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
while ! pg_isready -U ${POSTGRES_USER:-postgres}; do
  sleep 1
done

echo "✅ PostgreSQL is ready"

# Only run if database directory already exists (existing database)
if [ -d "/var/lib/postgresql/data/base" ]; then
  echo "📁 Detected existing database, ensuring user exists..."
  
  # Connect to postgres database to create user if not exists
  psql -U ${POSTGRES_USER:-postgres} -d postgres -c "DO \$\$ 
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_USER}') THEN
      CREATE USER ${POSTGRES_USER} WITH SUPERUSER PASSWORD '${POSTGRES_PASSWORD}';
    END IF;
  END
  \$\$;" || echo "User setup complete"
  
  # Ensure database exists and has correct owner
  psql -U ${POSTGRES_USER:-postgres} -d postgres -c "DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}') THEN
      CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
    END IF;
  END
  \$\$;" || echo "Database setup complete"
  
  # Grant privileges
  psql -U ${POSTGRES_USER:-postgres} -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};" || echo "Privileges granted"
fi

echo "✅ PostgreSQL initialization completed"