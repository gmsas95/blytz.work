#!/bin/bash

# Firebase Configuration Verification Script
# This script verifies that Firebase is properly configured in the deployed environment

set -e

echo "🔍 Firebase Configuration Verification"
echo "====================================="
echo "Generated: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        *)
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Function to check if a variable contains placeholder text
is_placeholder() {
    local value="$1"
    if [[ "$value" == *"REPLACE_WITH"* ]] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"XXXX"* ]]; then
        return 0  # Is placeholder
    fi
    return 1  # Is not placeholder
}

# Function to check Firebase frontend variables
check_frontend_firebase() {
    echo "📱 Frontend Firebase Configuration"
    echo "---------------------------------"
    
    local frontend_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    local all_valid=true
    local essential_valid=0
    
    for var in "${frontend_vars[@]}"; do
        local value="${!var}"
        local var_name=$(echo "$var" | sed 's/NEXT_PUBLIC_//')
        
        if [ -z "$value" ]; then
            print_status "ERROR" "$var_name: NOT SET"
            all_valid=false
        elif is_placeholder "$value"; then
            print_status "ERROR" "$var_name: CONTAINS PLACEHOLDER ($value)"
            all_valid=false
        else
            print_status "OK" "$var_name: SET"
            
            # Check essential variables
            if [[ "$var" == *"API_KEY"* ]] || [[ "$var" == *"AUTH_DOMAIN"* ]] || [[ "$var" == *"PROJECT_ID"* ]]; then
                ((essential_valid++))
            fi
        fi
    done
    
    if [ $essential_valid -eq 3 ]; then
        print_status "OK" "All essential frontend variables are configured"
    else
        print_status "ERROR" "Missing essential frontend variables (need API_KEY, AUTH_DOMAIN, PROJECT_ID)"
        all_valid=false
    fi
    
    echo ""
    return $([ "$all_valid" = true ] && echo 0 || echo 1)
}

# Function to check Firebase backend variables
check_backend_firebase() {
    echo "🔧 Backend Firebase Configuration"
    echo "--------------------------------"
    
    local backend_vars=(
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
    )
    
    local all_valid=true
    
    for var in "${backend_vars[@]}"; do
        local value="${!var}"
        local var_name=$(echo "$var" | sed 's/FIREBASE_//')
        
        if [ -z "$value" ]; then
            print_status "ERROR" "$var_name: NOT SET"
            all_valid=false
        elif is_placeholder "$value"; then
            print_status "ERROR" "$var_name: CONTAINS PLACEHOLDER"
            all_valid=false
        else
            print_status "OK" "$var_name: SET"
            
            # Additional checks for private key
            if [ "$var" = "FIREBASE_PRIVATE_KEY" ]; then
                if echo "$value" | grep -q "-----BEGIN PRIVATE KEY-----"; then
                    print_status "OK" "Private key has BEGIN marker"
                else
                    print_status "ERROR" "Private key missing BEGIN marker"
                    all_valid=false
                fi
                
                if echo "$value" | grep -q "-----END PRIVATE KEY-----"; then
                    print_status "OK" "Private key has END marker"
                else
                    print_status "ERROR" "Private key missing END marker"
                    all_valid=false
                fi
                
                # Check for proper newlines
                if echo "$value" | grep -q "\\\\n"; then
                    print_status "OK" "Private key has newline characters"
                else
                    print_status "WARN" "Private key may be missing newline characters"
                fi
            fi
        fi
    done
    
    echo ""
    return $([ "$all_valid" = true ] && echo 0 || echo 1)
}

# Function to test Firebase connection
test_firebase_connection() {
    echo "🔗 Testing Firebase Connection"
    echo "------------------------------"
    
    # Test frontend Firebase config
    print_status "INFO" "Testing frontend Firebase initialization..."
    
    # Check if we can access the debug endpoint
    local frontend_url="${FRONTEND_URL:-https://blytz.work}"
    local debug_url="${frontend_url}/debug/firebase"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "HTTP_CODE:%{http_code}" "$debug_url" 2>/dev/null || echo "HTTP_CODE:000")
        local http_code=$(echo "$response" | grep "HTTP_CODE:" | sed 's/HTTP_CODE://')
        
        if [ "$http_code" = "200" ]; then
            print_status "OK" "Firebase debug page accessible"
            
            # Check response for Firebase initialization status
            if echo "$response" | grep -q "firebaseInitialized.*true"; then
                print_status "OK" "Frontend Firebase initialized successfully"
            else
                print_status "ERROR" "Frontend Firebase initialization failed"
            fi
        else
            print_status "ERROR" "Cannot access Firebase debug page (HTTP $http_code)"
        fi
    else
        print_status "WARN" "curl not available - cannot test Firebase connection"
    fi
    
    # Test backend Firebase config
    print_status "INFO" "Testing backend Firebase configuration..."
    
    local backend_url="${API_URL:-https://gateway.blytz.work}"
    local health_url="${backend_url}/api/health"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "HTTP_CODE:%{http_code}" "$health_url" 2>/dev/null || echo "HTTP_CODE:000")
        local http_code=$(echo "$response" | grep "HTTP_CODE:" | sed 's/HTTP_CODE://')
        
        if [ "$http_code" = "200" ]; then
            print_status "OK" "Backend health check passed"
            
            # Check for Firebase in the response
            if echo "$response" | grep -q "firebase"; then
                print_status "OK" "Backend Firebase configuration detected"
            else
                print_status "WARN" "Backend Firebase status unclear from health check"
            fi
        else
            print_status "ERROR" "Backend health check failed (HTTP $http_code)"
        fi
    else
        print_status "WARN" "curl not available - cannot test backend connection"
    fi
    
    echo ""
}

# Function to provide recommendations
provide_recommendations() {
    echo "💡 Recommendations"
    echo "=================="
    
    local has_issues=false
    
    # Check for placeholder values
    for var in $(env | grep -E "(FIREBASE|NEXT_PUBLIC_FIREBASE)" | cut -d= -f1); do
        local value="${!var}"
        if is_placeholder "$value"; then
            print_status "ERROR" "Replace placeholder in $var"
            has_issues=true
        fi
    done
    
    # Check for missing essential variables
    local essential_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
    )
    
    for var in "${essential_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_status "ERROR" "Set $var in your environment"
            has_issues=true
        fi
    done
    
    if [ "$has_issues" = false ]; then
        print_status "OK" "Firebase configuration appears to be properly set!"
        echo ""
        echo "Next steps:"
        echo "1. Test authentication flow in your browser"
        echo "2. Check the Firebase debug page: ${FRONTEND_URL:-https://blytz.work}/debug/firebase"
        echo "3. Monitor Firebase Console for new user registrations"
    else
        echo ""
        echo "To fix these issues:"
        echo "1. Follow the complete setup guide: docs/FIREBASE_SETUP_COMPLETE_GUIDE.md"
        echo "2. Replace all REPLACE_WITH_ values in your .env.dokploy file"
        echo "3. Ensure the private key is properly formatted with \\n characters"
        echo "4. Redeploy your application after updating environment variables"
    fi
    
    echo ""
}

# Function to check environment consistency
check_environment_consistency() {
    echo "🔍 Environment Consistency Check"
    echo "================================"
    
    # Check if project IDs match
    local frontend_project_id="$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    local backend_project_id="$FIREBASE_PROJECT_ID"
    
    if [ -n "$frontend_project_id" ] && [ -n "$backend_project_id" ]; then
        if [ "$frontend_project_id" = "$backend_project_id" ]; then
            print_status "OK" "Project IDs match between frontend and backend"
        else
            print_status "ERROR" "Project ID mismatch: frontend=$frontend_project_id, backend=$backend_project_id"
        fi
    else
        print_status "WARN" "Cannot verify project ID consistency (missing values)"
    fi
    
    # Check if auth domains match project
    if [ -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" ] && [ -n "$frontend_project_id" ]; then
        local expected_domain="${frontend_project_id}.firebaseapp.com"
        if [[ "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" == *"$expected_domain"* ]]; then
            print_status "OK" "Auth domain matches project ID"
        else
            print_status "WARN" "Auth domain may not match project ID"
        fi
    fi
    
    echo ""
}

# Main execution
main() {
    echo "Checking Firebase configuration in current environment..."
    echo ""
    
    # Load environment variables if .env.dokploy exists
    if [ -f ".env.dokploy" ]; then
        echo "Loading environment variables from .env.dokploy..."
        set -a
        source .env.dokploy
        set +a
        echo ""
    fi
    
    # Run all checks
    local frontend_result=0
    local backend_result=0
    
    check_frontend_firebase
    frontend_result=$?
    
    check_backend_firebase
    backend_result=$?
    
    check_environment_consistency
    
    test_firebase_connection
    
    provide_recommendations
    
    # Final status
    echo "🎯 Verification Complete!"
    echo "========================="
    
    if [ $frontend_result -eq 0 ] && [ $backend_result -eq 0 ]; then
        print_status "OK" "Firebase configuration is properly set!"
        exit 0
    else
        print_status "ERROR" "Firebase configuration has issues that need to be fixed"
        exit 1
    fi
}

# Run main function
main "$@"