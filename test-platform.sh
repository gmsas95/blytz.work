#!/bin/bash

echo "🧪 Testing Blytz Hire Platform..."

echo ""
echo "📊 1. Testing Backend Health..."
curl -s http://localhost:3010/health || echo "❌ Backend not accessible directly"

echo ""
echo "🔗 2. Testing via Nginx..."
curl -s http://localhost:8081/api/health || echo "❌ Backend not accessible via Nginx"

echo ""
echo "🐳 3. Container Status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(backend|nginx|frontend|supabase)"

echo ""
echo "🗄️ 4. Database Connection..."
cd /home/sas/blytz-hire/backend && echo "Testing database connection..." && timeout 5 npx prisma db push 2>/dev/null && echo "✅ Database connected" || echo "❌ Database connection failed"

echo ""
echo "📝 5. Backend Logs (last 5 lines)..."
docker logs blytz-hire-backend --tail 5

echo ""
echo "✅ Platform Test Complete!"