#!/bin/sh
set -e

echo "Running PostgreSQL user setup..."

# Connect to default postgres database and ensure user exists
psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" << EOSQL
DO \$\$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$POSTGRES_USER') THEN
        EXECUTE 'ALTER USER $POSTGRES_USER WITH SUPERUSER PASSWORD ''' || '$POSTGRES_PASSWORD' || '''';
        RAISE NOTICE 'User $POSTGRES_USER updated';
    ELSE
        EXECUTE 'CREATE USER $POSTGRES_USER WITH SUPERUSER PASSWORD ''' || '$POSTGRES_PASSWORD' || '''';
        RAISE NOTICE 'User $POSTGRES_USER created';
    END IF;
END
\$\$;
EOSQL

# Ensure database exists with correct owner
psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" << EOSQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB') THEN
        EXECUTE 'CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER';
        RAISE NOTICE 'Database $POSTGRES_DB created';
    ELSE
        EXECUTE 'ALTER DATABASE $POSTGRES_DB OWNER TO $POSTGRES_USER';
        RAISE NOTICE 'Database $POSTGRES_DB owner updated';
    END IF;
END
\$\$;
EOSQL

echo "PostgreSQL user and database setup complete"