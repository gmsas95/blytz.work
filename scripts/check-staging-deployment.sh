#!/bin/bash

echo "🔍 Staging Deployment Verification Script"
echo "======================================"
echo ""

# Function to check container status
check_container_status() {
    echo "📦 Checking container status..."
    docker-compose -f docker-compose.final.yml ps
    echo ""
}

# Function to check database initialization
check_database_init() {
    echo "🗄️ Checking database initialization..."
    
    # Check if PostgreSQL container is running
    POSTGRES_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q postgres)
    if [ -z "$POSTGRES_CONTAINER" ]; then
        echo "❌ PostgreSQL container is not running"
        return 1
    fi
    
    echo "✅ PostgreSQL container is running"
    
    # Check if blytz_user exists
    USER_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='blytz_user'")
    if [ "$USER_EXISTS" = "1" ]; then
        echo "✅ blytz_user exists"
    else
        echo "❌ blytz_user does not exist"
        return 1
    fi
    
    # Check if blytz_work database exists
    DB_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='blytz_work'")
    if [ "$DB_EXISTS" = "1" ]; then
        echo "✅ blytz_work database exists"
    else
        echo "❌ blytz_work database does not exist"
        return 1
    fi
    
    # Check if blytz_hire schema exists
    SCHEMA_EXISTS=$(docker exec $POSTGRES_CONTAINER psql -U postgres -d blytz_work -tAc "SELECT 1 FROM information_schema.schemata WHERE schema_name='blytz_hire'")
    if [ "$SCHEMA_EXISTS" = "1" ]; then
        echo "✅ blytz_hire schema exists"
    else
        echo "❌ blytz_hire schema does not exist"
        return 1
    fi
    
    echo "✅ Database initialization completed successfully"
    return 0
}

# Function to check backend logs
check_backend_logs() {
    echo "🔧 Checking backend logs..."
    
    BACKEND_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q backend-final)
    if [ -z "$BACKEND_CONTAINER" ]; then
        echo "❌ Backend container is not running"
        return 1
    fi
    
    echo "📋 Recent backend logs:"
    docker logs --tail 20 $BACKEND_CONTAINER
    echo ""
}

# Function to check frontend logs
check_frontend_logs() {
    echo "🌐 Checking frontend logs..."
    
    FRONTEND_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q frontend-final)
    if [ -z "$FRONTEND_CONTAINER" ]; then
        echo "❌ Frontend container is not running"
        return 1
    fi
    
    echo "📋 Recent frontend logs:"
    docker logs --tail 20 $FRONTEND_CONTAINER
    echo ""
}

# Function to test database connection
test_database_connection() {
    echo "🔗 Testing database connection..."
    
    BACKEND_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q backend-final)
    if [ -z "$BACKEND_CONTAINER" ]; then
        echo "❌ Backend container is not running"
        return 1
    fi
    
    # Test database connection from backend container
    docker exec $BACKEND_CONTAINER npm run db:test 2>/dev/null || {
        echo "❌ Database connection test failed"
        echo "💡 This might be due to missing environment variables"
        return 1
    }
    
    echo "✅ Database connection test passed"
    return 0
}

# Function to check environment variables
check_env_variables() {
    echo "🔍 Checking environment variables..."
    
    BACKEND_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q backend-final)
    if [ -z "$BACKEND_CONTAINER" ]; then
        echo "❌ Backend container is not running"
        return 1
    fi
    
    echo "📋 Backend environment variables:"
    docker exec $BACKEND_CONTAINER env | grep -E "(FIREBASE|DATABASE|REDIS|STRIPE|JWT)" | sort
    echo ""
    
    FRONTEND_CONTAINER=$(docker-compose -f docker-compose.final.yml ps -q frontend-final)
    if [ -z "$FRONTEND_CONTAINER" ]; then
        echo "❌ Frontend container is not running"
        return 1
    fi
    
    echo "📋 Frontend environment variables:"
    docker exec $FRONTEND_CONTAINER env | grep -E "(NEXT_PUBLIC_FIREBASE|NEXT_PUBLIC_STRIPE)" | sort
    echo ""
}

# Function to provide next steps
provide_next_steps() {
    echo "🎯 Next Steps:"
    echo "============="
    echo ""
    echo "1. If environment variables are missing:"
    echo "   - Add them to your Dokploy dashboard"
    echo "   - Refer to STAGING_ENVIRONMENT_FIXES.md for the complete list"
    echo ""
    echo "2. If database initialization failed:"
    echo "   - Check PostgreSQL container logs: docker logs blytzwork-unified-postgres"
    echo "   - Verify environment variables are set correctly"
    echo "   - Consider manual database setup if needed"
    echo ""
    echo "3. If Firebase configuration is missing:"
    echo "   - Get Firebase config from Firebase Console > Project Settings"
    echo "   - Add all required Firebase variables to Dokploy"
    echo ""
    echo "4. After fixing issues:"
    echo "   - Redeploy from Dokploy dashboard"
    echo "   - Run this script again to verify"
    echo ""
    echo "5. Test application functionality:"
    echo "   - Access staging URL in browser"
    echo "   - Test authentication flow"
    echo "   - Test database operations"
    echo ""
}

# Main execution
main() {
    echo "Starting staging deployment verification..."
    echo ""
    
    check_container_status
    check_database_init
    check_backend_logs
    check_frontend_logs
    test_database_connection
    check_env_variables
    provide_next_steps
    
    echo "✅ Verification complete!"
}

# Run main function
main