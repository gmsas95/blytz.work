#!/bin/bash
set -e

# Database initialization script
# Creates a restricted app user instead of using the postgres superuser

echo "🔐 Initializing database security setup..."

# Create app user with limited permissions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Drop user if exists (for clean restarts)
    DROP USER IF EXISTS ${POSTGRES_APP_USER};

    -- Create restricted application user
    CREATE USER ${POSTGRES_APP_USER} WITH PASSWORD '${POSTGRES_APP_PASSWORD}';

    -- Grant minimal necessary permissions
    GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_APP_USER};
    GRANT USAGE ON SCHEMA public TO ${POSTGRES_APP_USER};
    GRANT CREATE ON SCHEMA public TO ${POSTGRES_APP_USER};

    -- Grant all table privileges (for Prisma migrations to work)
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${POSTGRES_APP_USER};

    -- Grant sequence privileges (for auto-increment IDs)
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${POSTGRES_APP_USER};

    -- Note: Existing tables need privileges updated after migration
    -- This is handled by GRANT ALL ON ALL TABLES below

    -- Grant privileges on all existing tables
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${POSTGRES_APP_USER};
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${POSTGRES_APP_USER};

    -- Enable pg_stat_statements for monitoring (optional)
    CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

    -- Grant read access to pg_stat_statements
    GRANT SELECT ON pg_stat_statements TO ${POSTGRES_APP_USER};
EOSQL

echo "✅ Database user ${POSTGRES_APP_USER} created with restricted permissions"
echo "📋 Update your DATABASE_URL to use the app user:"
echo "   postgresql://${POSTGRES_APP_USER}:${POSTGRES_APP_PASSWORD}@postgres:5432/${POSTGRES_DB}"
