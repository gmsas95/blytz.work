#!/bin/bash

# Authentication Debug Script for Hyred Platform
# This script helps diagnose authentication issues

set -e

echo "🔍 Authentication System Debug Report"
echo "====================================="
echo "Generated: $(date)"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local method="${3:-GET}"
    local auth_header="${4:-}"
    
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    
    local curl_cmd="curl -s -w \"HTTP_CODE:%{http_code}\" -X $method"
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H \"Authorization: Bearer $auth_header\""
    fi
    
    curl_cmd="$curl_cmd $endpoint"
    
    local response=$(eval $curl_cmd 2>/dev/null || echo "HTTP_CODE:000")
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | sed 's/HTTP_CODE://')
    local body=$(echo "$response" | sed '$d') # Remove last line (HTTP_CODE)
    
    echo "Response Code: $http_code"
    
    if [ "$http_code" = "000" ]; then
        echo "❌ Connection failed"
    elif [ "$http_code" = "200" ]; then
        echo "✅ Success"
    elif [ "$http_code" = "401" ]; then
        echo "⚠️  Unauthorized - Check authentication"
    elif [ "$http_code" = "500" ]; then
        echo "❌ Server error - Check backend logs"
    else
        echo "⚠️  Unexpected response: $http_code"
    fi
    
    if [ -n "$body" ] && [ ${#body} -lt 500 ]; then
        echo "Response: $body"
    fi
    
    echo "---"
}

# Function to check environment variables
check_env_vars() {
    echo "🔐 Environment Variables Check"
    echo "=============================="
    
    # Backend Firebase vars
    echo "Backend Firebase Configuration:"
    if [ -n "$FIREBASE_PROJECT_ID" ]; then
        echo "✅ FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}"
    else
        echo "❌ FIREBASE_PROJECT_ID: NOT SET"
    fi
    
    if [ -n "$FIREBASE_CLIENT_EMAIL" ]; then
        echo "✅ FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}"
    else
        echo "❌ FIREBASE_CLIENT_EMAIL: NOT SET"
    fi
    
    if [ -n "$FIREBASE_PRIVATE_KEY" ]; then
        echo "✅ FIREBASE_PRIVATE_KEY: SET (${#FIREBASE_PRIVATE_KEY} chars)"
        # Check key format
        if echo "$FIREBASE_PRIVATE_KEY" | grep -q "-----BEGIN PRIVATE KEY-----"; then
            echo "✅ Private key has BEGIN marker"
        else
            echo "⚠️  Private key missing BEGIN marker"
        fi
        if echo "$FIREBASE_PRIVATE_KEY" | grep -q "-----END PRIVATE KEY-----"; then
            echo "✅ Private key has END marker"
        else
            echo "⚠️  Private key missing END marker"
        fi
    else
        echo "❌ FIREBASE_PRIVATE_KEY: NOT SET"
    fi
    
    echo ""
    echo "Frontend Firebase Configuration:"
    # Frontend Firebase vars
    if [ -n "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
        echo "✅ NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY:0:20}..."
    else
        echo "❌ NEXT_PUBLIC_FIREBASE_API_KEY: NOT SET"
    fi
    
    if [ -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" ]; then
        echo "✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}"
    else
        echo "❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: NOT SET"
    fi
    
    if [ -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
        echo "✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${NEXT_PUBLIC_FIREBASE_PROJECT_ID}"
    else
        echo "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID: NOT SET"
    fi
    
    echo ""
}

# Function to check Docker containers
check_containers() {
    echo "🐳 Docker Containers Status"
    echo "==========================="
    
    if command_exists docker; then
        echo "Container Status:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.State}}" 2>/dev/null || echo "❌ Docker not accessible"
        
        echo ""
        echo "Recent Container Logs (last 10 lines):"
        if docker ps --format "{{.Names}}" | grep -q "backend"; then
            BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep "backend" | head -1)
            echo "Backend container ($BACKEND_CONTAINER):"
            docker logs "$BACKEND_CONTAINER" --tail 5 2>/dev/null | grep -E "(Firebase|Auth|Error)" || echo "No recent auth-related logs"
        fi
    else
        echo "❌ Docker not available"
    fi
    
    echo ""
}

# Function to test backend endpoints
test_backend() {
    echo "🔧 Backend API Tests"
    echo "==================="
    
    local base_url="${NEXT_PUBLIC_API_URL:-https://gateway.blytz.work}"
    
    # Test health endpoint
    test_api_endpoint "$base_url/api/health" "Health Check"
    
    # Test auth endpoints with dev tokens
    test_api_endpoint "$base_url/api/auth/profile" "Auth Profile (No Auth)"
    test_api_endpoint "$base_url/api/auth/profile" "Auth Profile (Dev Admin)" "GET" "dev-token-admin"
    test_api_endpoint "$base_url/api/auth/profile" "Auth Profile (Dev Company)" "GET" "dev-token-company"
    test_api_endpoint "$base_url/api/auth/profile" "Auth Profile (Dev VA)" "GET" "dev-token-va"
    
    echo ""
}

# Function to check database connection
check_database() {
    echo "🗄️ Database Connection"
    echo "====================="
    
    if [ -n "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL is set"
        echo "Database: $(echo "$DATABASE_URL" | sed 's/postgresql:\/\/[^:]*:[^@]*@/postgresql:\/\/***:***@/')"
        
        # Test database connection if Prisma is available
        if command_exists npx && [ -d "backend" ]; then
            echo "Testing database connection..."
            cd backend && timeout 5 npx prisma db ping 2>/dev/null && echo "✅ Database connection successful" || echo "⚠️  Database connection failed"
            cd ..
        fi
    else
        echo "❌ DATABASE_URL is not set"
    fi
    
    echo ""
}

# Function to provide recommendations
provide_recommendations() {
    echo "💡 Recommendations"
    echo "=================="
    
    local has_issues=false
    
    # Check for missing Firebase config
    if [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_CLIENT_EMAIL" ] || [ -z "$FIREBASE_PRIVATE_KEY" ]; then
        echo "🔧 Firebase Backend Issues:"
        echo "  1. Set up Firebase project at https://console.firebase.google.com/"
        echo "  2. Go to Project Settings > Service Accounts"
        echo "  3. Generate new private key"
        echo "  4. Copy values to your .env file"
        echo ""
        has_issues=true
    fi
    
    # Check for missing frontend config
    if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ] || [ -z "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" ]; then
        echo "🔧 Firebase Frontend Issues:"
        echo "  1. Go to Firebase Console > Project Settings"
        echo "  2. Under 'Your apps', click Web icon (</>)"
        echo "  3. Copy the configuration to your .env file"
        echo ""
        has_issues=true
    fi
    
    # Check private key format
    if [ -n "$FIREBASE_PRIVATE_KEY" ]; then
        if ! echo "$FIREBASE_PRIVATE_KEY" | grep -q "-----BEGIN PRIVATE KEY-----"; then
            echo "🔧 Private Key Format Issues:"
            echo "  1. Ensure private key includes BEGIN/END markers"
            echo "  2. Replace actual newlines with \\n in .env file"
            echo "  3. Wrap entire key in quotes"
            echo ""
            has_issues=true
        fi
    fi
    
    if [ "$has_issues" = false ]; then
        echo "✅ All authentication components appear to be properly configured!"
        echo ""
        echo "Next steps:"
        echo "1. Test the authentication flow in your browser"
        echo "2. Navigate to /auth and try registering a new user"
        echo "3. Check that users appear in Firebase Console"
    fi
    
    echo ""
}

# Main execution
main() {
    # Check environment variables first
    check_env_vars
    
    # Check containers
    check_containers
    
    # Check database
    check_database
    
    # Test backend
    test_backend
    
    # Provide recommendations
    provide_recommendations
    
    echo "🎯 Debug Complete!"
    echo "==================="
    echo "For more detailed setup instructions, see: docs/FIREBASE_AUTH_SETUP.md"
    echo "To run Firebase environment setup: ./scripts/setup-firebase-env.sh"
}

# Run main function
main "$@"