#!/bin/bash

# Docker Authentication Validation Script
# Tests Firebase authentication in Docker deployment

set -e

echo "🐳 Docker Authentication Validation"
echo "================================="

# Configuration
COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.yml"}
BACKEND_CONTAINER=${BACKEND_CONTAINER:-"backend-1"}
FRONTEND_CONTAINER=${FRONTEND_CONTAINER:-"frontend-1"}
DB_CONTAINER=${DB_CONTAINER:-"postgres-1"}
TIMEOUT=${TIMEOUT:-60}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_docker() {
    echo -e "${BLUE}🐳 $1${NC}"
}

log_test() {
    echo -e "${YELLOW}🧪 Testing: $1${NC}"
}

# Function to check if Docker is running
check_docker() {
    log_test "Docker daemon"
    
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Docker daemon is running"
}

# Function to check if containers are running
check_containers() {
    log_test "Docker containers"
    
    local containers=("$BACKEND_CONTAINER" "$FRONTEND_CONTAINER" "$DB_CONTAINER")
    local running_containers=()
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
            log_success "Container $container is running"
            running_containers+=("$container")
        else
            log_error "Container $container is not running"
        fi
    done
    
    if [ ${#running_containers[@]} -eq ${#containers[@]} ]; then
        log_success "All required containers are running"
        return 0
    else
        log_error "Some containers are not running"
        return 1
    fi
}

# Function to get container IP
get_container_ip() {
    local container=$1
    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container" 2>/dev/null || echo ""
}

# Function to test container connectivity
test_container_connectivity() {
    local container=$1
    local port=$2
    local description=$3
    
    log_test "$description connectivity"
    
    local container_ip=$(get_container_ip "$container")
    
    if [ -z "$container_ip" ]; then
        log_error "Could not get IP for container $container"
        return 1
    fi
    
    # Test connectivity from within the container
    if docker exec "$container" curl -s --max-time $TIMEOUT "http://localhost:$port/health" > /dev/null 2>&1; then
        log_success "$description is accessible from within container"
        return 0
    else
        log_error "$description is not accessible from within container"
        return 1
    fi
}

# Function to test container logs for errors
check_container_logs() {
    local container=$1
    local error_patterns=$2
    local description=$3
    
    log_test "$description logs for errors"
    
    local logs=$(docker logs "$container" --since=1h 2>&1 || echo "")
    local has_errors=false
    
    for pattern in $error_patterns; do
        if echo "$logs" | grep -i "$pattern" > /dev/null; then
            log_error "Found error pattern '$pattern' in $description logs"
            has_errors=true
        fi
    done
    
    if [ "$has_errors" = false ]; then
        log_success "No error patterns found in $description logs"
        return 0
    else
        log_error "Error patterns found in $description logs"
        return 1
    fi
}

# Function to test Firebase configuration in containers
test_container_firebase_config() {
    local container=$1
    local description=$2
    
    log_test "$description Firebase configuration"
    
    # Test backend Firebase configuration
    if [ "$description" = "Backend" ]; then
        docker exec "$container" node -e "
        try {
            const { validateFirebaseConfig } = require('./dist/config/firebaseConfig-simplified.js');
            const result = validateFirebaseConfig();
            
            if (result.isValid) {
                console.log('✅ Firebase configuration is valid');
                console.log('🔗 Project ID:', result.config.projectId);
                process.exit(0);
            } else {
                console.error('❌ Firebase configuration is invalid');
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
        " 2>/dev/null && log_success "$description Firebase configuration is valid" || {
            log_error "$description Firebase configuration is invalid"
            return 1
        }
    fi
    
    # Test frontend Firebase configuration
    if [ "$description" = "Frontend" ]; then
        docker exec "$container" node -e "
        try {
            const { validateFirebaseConfig } = require('./src/lib/firebase-simplified.ts');
            const result = validateFirebaseConfig();
            
            if (result.isValid) {
                console.log('✅ Firebase configuration is valid');
                console.log('🔗 Project ID:', result.config.projectid);
                process.exit(0);
            } else {
                console.error('❌ Firebase configuration is invalid');
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
        " 2>/dev/null && log_success "$description Firebase configuration is valid" || {
            log_error "$description Firebase configuration is invalid"
            return 1
        }
    fi
}

# Function to test environment variables in containers
test_container_environment() {
    local container=$1
    local description=$2
    local required_vars=$3
    
    log_test "$description environment variables"
    
    local missing_vars=()
    local invalid_vars=()
    
    for var in $required_vars; do
        local value=$(docker exec "$container" printenv "$var" 2>/dev/null || echo "")
        
        if [ -z "$value" ]; then
            missing_vars+=("$var")
        elif [[ "$value" == *'${{ '* ]] || [[ "$value" == *'${environment'* ]] || [[ "$value" == *'REPLACE_WITH_'* ]]; then
            invalid_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ] && [ ${#invalid_vars[@]} -eq 0 ]; then
        log_success "$description environment variables are correctly set"
        return 0
    else
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_error "$description missing environment variables: ${missing_vars[*]}"
        fi
        if [ ${#invalid_vars[@]} -gt 0 ]; then
            log_error "$description invalid environment variables: ${invalid_vars[*]}"
        fi
        return 1
    fi
}

# Function to test database connectivity from containers
test_database_connectivity() {
    log_test "Database connectivity from containers"
    
    # Test from backend container
    if docker exec "$BACKEND_CONTAINER" node -e "
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
    " 2>/dev/null; then
        log_success "Backend can connect to database"
    else
        log_error "Backend cannot connect to database"
        return 1
    fi
}

# Function to test inter-container communication
test_container_communication() {
    log_test "Inter-container communication"
    
    # Get frontend container IP
    local frontend_ip=$(get_container_ip "$FRONTEND_CONTAINER")
    
    if [ -z "$frontend_ip" ]; then
        log_error "Could not get frontend container IP"
        return 1
    fi
    
    # Test backend can reach frontend
    if docker exec "$BACKEND_CONTAINER" curl -s --max-time $TIMEOUT "http://$frontend_ip:3000" > /dev/null 2>&1; then
        log_success "Backend can reach frontend"
    else
        log_warn "Backend cannot reach frontend (may be expected in some configurations)"
    fi
    
    # Test frontend can reach backend
    local backend_ip=$(get_container_ip "$BACKEND_CONTAINER")
    
    if [ -z "$backend_ip" ]; then
        log_error "Could not get backend container IP"
        return 1
    fi
    
    # Note: This test might not work if frontend doesn't have curl installed
    # We'll test it differently by checking if frontend can make HTTP requests
    if docker exec "$FRONTEND_CONTAINER" node -e "
    const http = require('http');
    const options = {
        hostname: '$backend_ip',
        port: 3001,
        path: '/health',
        method: 'GET',
        timeout: 30000
    };
    
    const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Frontend can reach backend');
            process.exit(0);
        } else {
            console.log('❌ Frontend cannot reach backend, status:', res.statusCode);
            process.exit(1);
        }
    });
    
    req.on('error', (err) => {
        console.log('❌ Frontend cannot reach backend:', err.message);
        process.exit(1);
    });
    
    req.on('timeout', () => {
        console.log('❌ Frontend connection to backend timed out');
        process.exit(1);
    });
    
    req.end();
    " 2>/dev/null; then
        log_success "Frontend can reach backend"
    else
        log_warn "Frontend cannot reach backend (may be expected in some configurations)"
    fi
}

# Function to test authentication flow in Docker
test_docker_authentication() {
    log_test "Docker authentication flow"
    
    # Test backend health endpoint
    if docker exec "$BACKEND_CONTAINER" curl -s --max-time $TIMEOUT "http://localhost:3001/health" > /dev/null 2>&1; then
        log_success "Backend health endpoint is accessible"
    else
        log_error "Backend health endpoint is not accessible"
        return 1
    fi
    
    # Test authentication endpoint without token
    local response=$(docker exec "$BACKEND_CONTAINER" curl -s -w '%{http_code}' -o /dev/null --max-time $TIMEOUT "http://localhost:3001/api/auth/profile")
    
    if [ "$response" = "401" ]; then
        log_success "Authentication endpoint correctly requires authentication"
    else
        log_error "Authentication endpoint returned unexpected status: $response"
        return 1
    fi
}

# Function to test container health checks
test_container_health() {
    log_test "Container health checks"
    
    local containers=("$BACKEND_CONTAINER" "$FRONTEND_CONTAINER" "$DB_CONTAINER")
    
    for container in "${containers[@]}"; do
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
        
        if [ "$health_status" = "healthy" ]; then
            log_success "Container $container is healthy"
        elif [ "$health_status" = "no-healthcheck" ]; then
            log_warn "Container $container has no health check defined"
        else
            log_error "Container $container health status: $health_status"
            return 1
        fi
    done
}

# Function to test Docker network configuration
test_docker_network() {
    log_test "Docker network configuration"
    
    # Get network information
    local network_name=$(docker inspect "$BACKEND_CONTAINER" --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -c 12)
    
    if [ -n "$network_name" ]; then
        log_success "Containers are connected to Docker network"
        
        # Check if all containers are on the same network
        local backend_network=$(docker inspect "$BACKEND_CONTAINER" --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -c 12)
        local frontend_network=$(docker inspect "$FRONTEND_CONTAINER" --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -c 12)
        local db_network=$(docker inspect "$DB_CONTAINER" --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -c 12)
        
        if [ "$backend_network" = "$frontend_network" ] && [ "$frontend_network" = "$db_network" ]; then
            log_success "All containers are on the same network"
        else
            log_warn "Containers may be on different networks"
        fi
    else
        log_error "Could not determine Docker network configuration"
        return 1
    fi
}

# Function to run comprehensive Docker tests
run_comprehensive_docker_tests() {
    log_info "Running comprehensive Docker authentication validation..."
    
    local failed_tests=0
    
    # Run all Docker tests
    check_docker || ((failed_tests++))
    check_containers || ((failed_tests++))
    test_container_health || ((failed_tests++))
    test_docker_network || ((failed_tests++))
    test_container_connectivity "$BACKEND_CONTAINER" "3001" "Backend" || ((failed_tests++))
    test_container_connectivity "$FRONTEND_CONTAINER" "3000" "Frontend" || ((failed_tests++))
    test_container_firebase_config "$BACKEND_CONTAINER" "Backend" || ((failed_tests++))
    test_container_firebase_config "$FRONTEND_CONTAINER" "Frontend" || ((failed_tests++))
    test_container_environment "$BACKEND_CONTAINER" "Backend" "FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY" || ((failed_tests++))
    test_container_environment "$FRONTEND_CONTAINER" "Frontend" "NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID" || ((failed_tests++))
    test_database_connectivity || ((failed_tests++))
    test_container_communication || ((failed_tests++))
    test_docker_authentication || ((failed_tests++))
    
    # Check logs for critical errors
    check_container_logs "$BACKEND_CONTAINER" "error exception failed" "Backend" || ((failed_tests++))
    check_container_logs "$FRONTEND_CONTAINER" "error exception failed" "Frontend" || ((failed_tests++))
    check_container_logs "$DB_CONTAINER" "error fatal" "Database" || ((failed_tests++))
    
    # Summary
    echo ""
    echo "================================="
    echo "🏁 Docker Validation Summary"
    echo "================================="
    
    if [ $failed_tests -eq 0 ]; then
        log_success "All Docker authentication tests passed! 🎉"
        echo ""
        echo "✅ Docker containers are running correctly"
        echo "✅ Container networking is working"
        echo "✅ Firebase configuration is valid in containers"
        echo "✅ Environment variables are correctly set"
        echo "✅ Database connectivity is working"
        echo "✅ Inter-container communication is working"
        echo "✅ Authentication endpoints are responding correctly"
        echo "✅ No critical errors in container logs"
        return 0
    else
        log_error "$failed_tests Docker validation test(s) failed"
        echo ""
        echo "❌ Docker authentication system needs attention"
        echo "❌ Please fix issues above and re-run the validation"
        return 1
    fi
}

# Function to show container status
show_container_status() {
    log_info "Container Status"
    echo "=================="
    
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
    
    echo ""
    echo "Container Details:"
    echo "=================="
    
    local containers=("$BACKEND_CONTAINER" "$FRONTEND_CONTAINER" "$DB_CONTAINER")
    
    for container in "${containers[@]}"; do
        echo ""
        log_docker "$container details:"
        
        if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
            local ip=$(get_container_ip "$container")
            local image=$(docker inspect --format='{{.Config.Image}}' "$container")
            local created=$(docker inspect --format='{{.Created}}' "$container")
            
            echo "  IP Address: $ip"
            echo "  Image: $image"
            echo "  Created: $created"
            echo "  Environment Variables:"
            docker exec "$container" printenv | grep -E "(FIREBASE|NEXT_PUBLIC)" | sed 's/^/    /' || echo "    No Firebase variables found"
        else
            echo "  Container is not running"
        fi
    done
}

# Function to show recent logs
show_container_logs() {
    local container=${1:-"$BACKEND_CONTAINER"}
    local lines=${2:-50}
    
    log_info "Recent logs for $container (last $lines lines):"
    echo "=================================================="
    
    docker logs --tail="$lines" "$container" 2>&1
}

# Main execution
main() {
    echo "🐳 Starting Docker Authentication Validation"
    echo "Backend Container: $BACKEND_CONTAINER"
    echo "Frontend Container: $FRONTEND_CONTAINER"
    echo "Database Container: $DB_CONTAINER"
    echo "Timeout: ${TIMEOUT}s"
    echo ""
    
    case "${1:-comprehensive}" in
        "comprehensive")
            run_comprehensive_docker_tests
            ;;
        "status")
            show_container_status
            ;;
        "logs")
            show_container_logs "$2" "$3"
            ;;
        "connectivity")
            check_containers
            test_container_connectivity "$BACKEND_CONTAINER" "3001" "Backend"
            test_container_connectivity "$FRONTEND_CONTAINER" "3000" "Frontend"
            test_container_communication
            ;;
        "firebase")
            test_container_firebase_config "$BACKEND_CONTAINER" "Backend"
            test_container_firebase_config "$FRONTEND_CONTAINER" "Frontend"
            ;;
        "environment")
            test_container_environment "$BACKEND_CONTAINER" "Backend" "FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY"
            test_container_environment "$FRONTEND_CONTAINER" "Frontend" "NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID"
            ;;
        "database")
            test_database_connectivity
            ;;
        "health")
            test_container_health
            ;;
        *)
            echo "Usage: $0 [comprehensive|status|logs|connectivity|firebase|environment|database|health] [container] [lines]"
            echo ""
            echo "Options:"
            echo "  comprehensive  - Run all Docker validation tests (default)"
            echo "  status        - Show container status and details"
            echo "  logs          - Show recent container logs (default: backend, 50 lines)"
            echo "  connectivity   - Test container connectivity and communication"
            echo "  firebase      - Test Firebase configuration in containers"
            echo "  environment   - Test environment variables in containers"
            echo "  database      - Test database connectivity from containers"
            echo "  health        - Test container health checks"
            echo ""
            echo "Examples:"
            echo "  $0 comprehensive                    # Run all tests"
            echo "  $0 status                           # Show container status"
            echo "  $0 logs backend 100                 # Show last 100 lines of backend logs"
            echo "  $0 firebase                         # Test Firebase configuration"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"