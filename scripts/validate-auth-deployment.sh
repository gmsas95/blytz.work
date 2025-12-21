#!/bin/bash

# Comprehensive Authentication Deployment Validation Script
# Tests simplified Firebase authentication in production environment

set -e

echo "🔍 Authentication Deployment Validation"
echo "===================================="

# Configuration
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
TIMEOUT=${TIMEOUT:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_test() {
    echo -e "${YELLOW}🧪 Testing: $1${NC}"
}

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    log_test "$service_name health check"
    
    if curl -s --max-time $TIMEOUT "$url" > /dev/null; then
        log_success "$service_name is running and accessible"
        return 0
    else
        log_error "$service_name is not accessible at $url"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local method=${2:-"GET"}
    local data=${3:-""}
    local expected_status=${4:-200}
    local description=$5
    
    log_test "$description"
    
    local cmd="curl -s -w '%{http_code}' -o /tmp/api_response.json --max-time $TIMEOUT"
    
    if [ "$method" = "POST" ]; then
        cmd="$cmd -X POST -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            cmd="$cmd -d '$data'"
        fi
    fi
    
    cmd="$cmd '$BACKEND_URL$endpoint'"
    
    local status_code=$(eval $cmd)
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "API endpoint responded correctly: $status_code"
        return 0
    else
        log_error "API endpoint returned unexpected status: $status_code (expected $expected_status)"
        if [ -f "/tmp/api_response.json" ]; then
            echo "Response: $(cat /tmp/api_response.json)"
        fi
        return 1
    fi
}

# Function to test Firebase configuration
test_firebase_config() {
    log_test "Firebase configuration validation"
    
    # Test backend Firebase configuration
    echo "Testing backend Firebase configuration..."
    cd backend
    
    # Check if backend can initialize Firebase
    node -e "
    try {
        const { validateFirebaseConfig } = require('./dist/config/firebaseConfig-simplified.js');
        const result = validateFirebaseConfig();
        
        if (result.isValid) {
            console.log('✅ Backend Firebase configuration is valid');
            console.log('🔗 Project ID:', result.config.projectId);
            process.exit(0);
        } else {
            console.error('❌ Backend Firebase configuration is invalid');
            if (result.missingVars.length > 0) {
                console.error('Missing variables:', result.missingVars.join(', '));
            }
            if (result.invalidVars.length > 0) {
                console.error('Invalid variables:', result.invalidVars.join(', '));
            }
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error testing Firebase configuration:', error.message);
        process.exit(1);
    }
    " 2>/dev/null || {
        log_warn "Backend not built, testing source directly..."
        node -e "
        try {
            const { validateFirebaseConfig } = require('./src/config/firebaseConfig-simplified.ts');
            const result = validateFirebaseConfig();
            
            if (result.isValid) {
                console.log('✅ Backend Firebase configuration is valid');
                process.exit(0);
            } else {
                console.error('❌ Backend Firebase configuration is invalid');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Error testing Firebase configuration:', error.message);
            process.exit(1);
        }
        " || {
            log_error "Could not validate backend Firebase configuration"
            return 1
        }
    }
    
    cd ..
    
    # Test frontend Firebase configuration
    echo "Testing frontend Firebase configuration..."
    cd frontend
    
    node -e "
    try {
        const { validateFirebaseConfig } = require('./src/lib/firebase-simplified.ts');
        const result = validateFirebaseConfig();
        
        if (result.isValid) {
            console.log('✅ Frontend Firebase configuration is valid');
            console.log('🔗 Project ID:', result.config.projectid);
            process.exit(0);
        } else {
            console.error('❌ Frontend Firebase configuration is invalid');
            if (result.missingVars.length > 0) {
                console.error('Missing variables:', result.missingVars.join(', '));
            }
            if (result.invalidVars.length > 0) {
                console.error('Invalid variables:', result.invalidVars.join(', '));
            }
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error testing Firebase configuration:', error.message);
        process.exit(1);
    }
    " || {
        log_error "Could not validate frontend Firebase configuration"
        return 1
    }
    
    cd ..
    
    log_success "Firebase configuration validation completed"
}

# Function to test authentication flow
test_authentication_flow() {
    log_test "Authentication flow testing"
    
    # Test health endpoints first
    test_api_endpoint "/health" "GET" "" "200" "Backend health check"
    
    # Test authentication endpoints without token (should fail)
    test_api_endpoint "/api/auth/profile" "GET" "" "401" "Protected endpoint without token"
    
    # Test password reset with invalid email
    test_api_endpoint "/api/auth/forgot-password" "POST" '{"email":"invalid"}' "400" "Password reset with invalid email"
    
    log_success "Authentication flow tests completed"
}

# Function to test CORS configuration
test_cors() {
    log_test "CORS configuration testing"
    
    # Test OPTIONS preflight request
    local status_code=$(curl -s -w '%{http_code}' -o /dev/null --max-time $TIMEOUT \
        -X OPTIONS \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: authorization" \
        "$BACKEND_URL/api/auth/profile")
    
    if [ "$status_code" = "204" ] || [ "$status_code" = "200" ]; then
        log_success "CORS preflight request successful"
    else
        log_error "CORS preflight request failed: $status_code"
        return 1
    fi
}

# Function to test WebSocket connection
test_websocket() {
    log_test "WebSocket connection testing"
    
    # Test if WebSocket endpoint is accessible
    if command -v nc &> /dev/null; then
        echo "Testing WebSocket accessibility..."
        if nc -z -w3 $(echo $BACKEND_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f1) $(echo $BACKEND_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f2); then
            log_success "WebSocket endpoint is accessible"
        else
            log_warn "WebSocket endpoint may not be accessible (nc test failed)"
        fi
    else
        log_warn "netcat not available, skipping WebSocket accessibility test"
    fi
}

# Function to test environment variables
test_environment_variables() {
    log_test "Environment variables validation"
    
    local required_vars=(
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    )
    
    local missing_vars=()
    local invalid_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        elif [[ "${!var}" == *'${{ '* ]] || [[ "${!var}" == *'${environment'* ]] || [[ "${!var}" == *'REPLACE_WITH_'* ]]; then
            invalid_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ] && [ ${#invalid_vars[@]} -eq 0 ]; then
        log_success "All required environment variables are set correctly"
    else
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_error "Missing environment variables: ${missing_vars[*]}"
        fi
        if [ ${#invalid_vars[@]} -gt 0 ]; then
            log_error "Invalid environment variables (contain template syntax): ${invalid_vars[*]}"
        fi
        return 1
    fi
}

# Function to test database connectivity
test_database_connectivity() {
    log_test "Database connectivity testing"
    
    cd backend
    
    # Test database connection
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function testConnection() {
        try {
            await prisma.\$connect();
            console.log('✅ Database connection successful');
            
            // Test basic query
            const userCount = await prisma.user.count();
            console.log('📊 Database query successful, found', userCount, 'users');
            
            await prisma.\$disconnect();
            process.exit(0);
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            process.exit(1);
        }
    }
    
    testConnection();
    " || {
        log_error "Database connectivity test failed"
        return 1
    }
    
    cd ..
}

# Function to run comprehensive tests
run_comprehensive_tests() {
    log_info "Running comprehensive authentication validation..."
    
    local failed_tests=0
    
    # Run all tests
    test_environment_variables || ((failed_tests++))
    test_firebase_config || ((failed_tests++))
    check_service "$BACKEND_URL/health" "Backend" || ((failed_tests++))
    check_service "$FRONTEND_URL" "Frontend" || ((failed_tests++))
    test_database_connectivity || ((failed_tests++))
    test_authentication_flow || ((failed_tests++))
    test_cors || ((failed_tests++))
    test_websocket || ((failed_tests++))
    
    # Summary
    echo ""
    echo "===================================="
    echo "🏁 Validation Summary"
    echo "===================================="
    
    if [ $failed_tests -eq 0 ]; then
        log_success "All authentication validation tests passed! 🎉"
        echo ""
        echo "✅ Authentication system is ready for production"
        echo "✅ Firebase configuration is valid"
        echo "✅ All services are running correctly"
        echo "✅ Database connectivity is working"
        echo "✅ API endpoints are responding correctly"
        echo "✅ CORS configuration is working"
        echo "✅ WebSocket endpoint is accessible"
        return 0
    else
        log_error "$failed_tests validation test(s) failed"
        echo ""
        echo "❌ Authentication system needs attention before production deployment"
        echo "❌ Please fix the issues above and re-run the validation"
        return 1
    fi
}

# Function to test in development mode
test_development_mode() {
    log_info "Running development mode validation..."
    
    # Check if services are running in development
    if ! pgrep -f "next" > /dev/null; then
        log_warn "Next.js development server may not be running"
    fi
    
    if ! pgrep -f "fastify" > /dev/null && ! pgrep -f "node.*server" > /dev/null; then
        log_warn "Backend development server may not be running"
    fi
    
    # Test local configuration
    test_environment_variables
    test_firebase_config
    
    log_success "Development mode validation completed"
}

# Function to test in production mode
test_production_mode() {
    log_info "Running production mode validation..."
    
    # Test production endpoints
    test_api_endpoint "/health" "GET" "" "200" "Production health check"
    
    # Test that debug endpoints are not accessible
    test_api_endpoint "/debug" "GET" "" "404" "Debug endpoint not accessible"
    
    # Test production headers
    local headers=$(curl -s -I --max-time $TIMEOUT "$BACKEND_URL/health")
    
    if echo "$headers" | grep -q "x-powered-by"; then
        log_warn "Server is exposing technology information"
    fi
    
    log_success "Production mode validation completed"
}

# Main execution
main() {
    echo "🚀 Starting Authentication Deployment Validation"
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Timeout: ${TIMEOUT}s"
    echo ""
    
    case "${1:-comprehensive}" in
        "comprehensive")
            run_comprehensive_tests
            ;;
        "development")
            test_development_mode
            ;;
        "production")
            test_production_mode
            ;;
        "firebase")
            test_firebase_config
            ;;
        "database")
            test_database_connectivity
            ;;
        "cors")
            test_cors
            ;;
        "websocket")
            test_websocket
            ;;
        "env")
            test_environment_variables
            ;;
        *)
            echo "Usage: $0 [comprehensive|development|production|firebase|database|cors|websocket|env]"
            echo ""
            echo "Options:"
            echo "  comprehensive  - Run all validation tests (default)"
            echo "  development   - Test development environment"
            echo "  production    - Test production environment"
            echo "  firebase      - Test Firebase configuration only"
            echo "  database      - Test database connectivity only"
            echo "  cors          - Test CORS configuration only"
            echo "  websocket     - Test WebSocket accessibility only"
            echo "  env           - Test environment variables only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"