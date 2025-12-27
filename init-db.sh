#!/bin/bash
set -e

# Database initialization script
# Creates a restricted app user instead of using the postgres superuser
# Creates blytz_hire schema for Prisma

echo "🔐 Initializing database security setup..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Drop user if exists (for clean restarts)
    DROP USER IF EXISTS ${POSTGRES_APP_USER};

    -- Create restricted application user
    CREATE USER ${POSTGRES_APP_USER} WITH PASSWORD '${POSTGRES_APP_PASSWORD}';

    -- Create blytz_hire schema
    CREATE SCHEMA IF NOT EXISTS blytz_hire;

    -- Grant connect permission on database
    GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_APP_USER};

    -- Grant usage and create on blytz_hire schema
    GRANT USAGE ON SCHEMA blytz_hire TO ${POSTGRES_APP_USER};
    GRANT CREATE ON SCHEMA blytz_hire TO ${POSTGRES_APP_USER};

    -- Grant all privileges on blytz_hire schema for migrations
    ALTER DEFAULT PRIVILEGES IN SCHEMA blytz_hire
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${POSTGRES_APP_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA blytz_hire
        GRANT USAGE, SELECT ON SEQUENCES TO ${POSTGRES_APP_USER};

    -- Grant privileges on all existing objects in blytz_hire schema
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA blytz_hire TO ${POSTGRES_APP_USER};
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA blytz_hire TO ${POSTGRES_APP_USER};

    -- Set blytz_hire as default schema
    ALTER DATABASE ${POSTGRES_DB} SET search_path TO blytz_hire, public;

    -- Grant usage and create on public schema (for extensions)
    GRANT USAGE ON SCHEMA public TO ${POSTGRES_APP_USER};
    GRANT CREATE ON SCHEMA public TO ${POSTGRES_APP_USER};

    -- Grant privileges on public schema for extensions
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${POSTGRES_APP_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${POSTGRES_APP_USER};

    -- Enable pg_stat_statements for monitoring (optional)
    CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

    -- Grant read access to pg_stat_statements
    GRANT SELECT ON pg_stat_statements TO ${POSTGRES_APP_USER};
EOSQL

echo "✅ Database user ${POSTGRES_APP_USER} created with restricted permissions"
echo "✅ Schema blytz_hire created and configured"
echo "📋 Update your DATABASE_URL to use the app user and schema:"
echo "   postgresql://${POSTGRES_APP_USER}:${POSTGRES_APP_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=blytz_hire"
