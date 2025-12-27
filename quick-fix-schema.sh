#!/bin/bash
# Quick script to create blytz_hire schema manually
# Run this if restarting postgres doesn't work

CONTAINER="blytzwork-postgres"
USER="blytz_user"
DATABASE="blytz_work"

echo "🔧 Creating blytz_hire schema in database..."

docker exec -it $CONTAINER psql -U $USER -d $DATABASE <<'EOSQL'
-- Create schema
CREATE SCHEMA IF NOT EXISTS blytz_hire;

-- Grant permissions
GRANT ALL ON SCHEMA blytz_hire TO $USER;
GRANT ALL ON SCHEMA blytz_hire TO public;

-- Set as default schema
ALTER DATABASE $DATABASE SET search_path TO blytz_hire, public;

-- Verify
SELECT nspname AS schema_name FROM pg_namespace WHERE nspname = 'blytz_hire';
EOSQL

echo "✅ Schema blytz_hire created successfully!"
echo "📋 Now restart backend container to apply migrations"
