#!/bin/bash

# BlytzWork Production Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs]

set -e

COMPOSE_FILE="docker-compose.dokploy-ready.yml"
ENV_FILE=".env.production"

case "$1" in
    start)
        echo "🚀 Starting BlytzWork production..."
        docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
        echo "✅ BlytzWork started successfully!"
        echo "🌐 Access at: http://72.60.236.89:8081"
        ;;
    
    stop)
        echo "🛑 Stopping BlytzWork production..."
        docker compose -f $COMPOSE_FILE down
        echo "✅ BlytzWork stopped successfully!"
        ;;
    
    restart)
        echo "🔄 Restarting BlytzWork production..."
        docker compose -f $COMPOSE_FILE --env-file $ENV_FILE down
        docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
        echo "✅ BlytzWork restarted successfully!"
        echo "🌐 Access at: http://72.60.236.89:8081"
        ;;
    
    logs)
        echo "📋 Showing BlytzWork logs..."
        docker compose -f $COMPOSE_FILE logs -f
        ;;
    
    status)
        echo "📊 BlytzWork service status:"
        docker compose -f $COMPOSE_FILE ps
        ;;
    
    health)
        echo "🏥 Checking BlytzWork health status..."
        docker compose -f $COMPOSE_FILE ps --format "table {{.Names}}\t{{.Status}}"
        
        echo ""
        echo "🌐 Testing endpoints..."
        
        # Test nginx
        if curl -f http://localhost:8081/health > /dev/null 2>&1; then
            echo "✅ Nginx: Healthy"
        else
            echo "❌ Nginx: Unhealthy"
        fi
        
        # Test backend
        if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
            echo "✅ Backend: Healthy"
        else
            echo "❌ Backend: Unhealthy"
        fi
        
        # Test frontend
        if curl -f http://localhost:3003 > /dev/null 2>&1; then
            echo "✅ Frontend: Healthy"
        else
            echo "❌ Frontend: Unhealthy"
        fi
        ;;
    
    *)
        echo "📖 BlytzWork Deployment Script"
        echo "Usage: $0 {start|stop|restart|logs|status|health}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all BlytzWork services"
        echo "  stop    - Stop all BlytzWork services"
        echo "  restart - Restart all BlytzWork services"
        echo "  logs    - Show live logs"
        echo "  status  - Show service status"
        echo "  health  - Check health of all services"
        exit 1
        ;;
esac
