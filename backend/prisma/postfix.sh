#!/bin/sh
set -e

echo "PostgreSQL container started, checking user setup..."

# Wait a bit for PostgreSQL to be fully ready
sleep 5

# Run user setup script
echo "Running user setup for existing database..."
/docker-entrypoint-initdb.d/01-fix-user.sh

echo "PostgreSQL post-initialization complete"

# Keep the container running by executing postgres
exec docker-entrypoint.sh postgres