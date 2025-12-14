#!/bin/bash

# Health Check Test Script
# This script tests the health check endpoint to ensure it's working properly

echo "🔍 Testing Health Check Endpoint..."
echo "=================================="

# Test 1: Check if backend is running
echo "Test 1: Checking if backend is running on port 3000..."
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is running and responding to /health"
else
    echo "❌ Backend is not responding to /health on port 3000"
    echo "💡 Make sure the backend is running with: cd backend && npm run dev"
    exit 1
fi

# Test 2: Check response format
echo ""
echo "Test 2: Checking response format..."
RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Health check response format is correct"
    echo "📄 Response: $RESPONSE"
else
    echo "❌ Health check response format is incorrect"
    echo "📄 Response: $RESPONSE"
    exit 1
fi

# Test 3: Check /api/health endpoint
echo ""
echo "Test 3: Checking /api/health endpoint..."
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ /api/health endpoint is also working"
    API_RESPONSE=$(curl -s http://localhost:3000/api/health)
    echo "📄 Response: $API_RESPONSE"
else
    echo "❌ /api/health endpoint is not working"
    exit 1
fi

# Test 4: Check response time
echo ""
echo "Test 4: Checking response time..."
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/health > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$((($END_TIME - $START_TIME) / 1000000))
echo "⏱️ Response time: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo "✅ Response time is acceptable for health checks"
else
    echo "⚠️ Response time is slow, but may still work for Docker health checks"
fi

echo ""
echo "🎉 All health check tests passed!"
echo "The Docker health check should now work correctly."