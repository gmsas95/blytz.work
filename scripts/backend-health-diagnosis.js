#!/usr/bin/env node

/**
 * Backend Health Diagnosis Script
 * This script helps diagnose why the backend container is becoming unhealthy
 */

const http = require('http');
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Starting Backend Health Diagnosis...\n');

// Test 1: Check if server is listening on port 3000
function testServerListening() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing if server is listening on port 3000...');
    
    const req = http.get('http://localhost:3000/health', (res) => {
      console.log(`✅ Server responded with status: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check response:', response);
          resolve(true);
        } catch (e) {
          console.log('⚠️ Invalid JSON response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Server connection failed:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Server connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Check database connection
async function testDatabaseConnection() {
  console.log('\n2️⃣ Testing database connection...');
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    console.log('🔍 DATABASE_URL:', databaseUrl ? 'SET' : 'NOT SET');
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL environment variable is missing');
      return false;
    }

    const prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      }
    });

    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test 3: Check Firebase configuration
function testFirebaseConfig() {
  console.log('\n3️⃣ Testing Firebase configuration...');
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  let allPresent = true;
  
  for (const key of requiredVars) {
    const value = process.env[key] || 
                  process.env[`DOKPLOY_${key}`] || 
                  process.env[`${key}_DOKPLOY`];
    
    if (value) {
      console.log(`✅ ${key}: SET`);
    } else {
      console.log(`❌ ${key}: MISSING`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Test 4: Check environment variables
function testEnvironmentVariables() {
  console.log('\n4️⃣ Testing required environment variables...');
  
  const requiredVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'];
  let allPresent = true;
  
  for (const key of requiredVars) {
    const value = process.env[key];
    if (value) {
      console.log(`✅ ${key}: SET`);
    } else {
      console.log(`❌ ${key}: MISSING`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Test 5: Check if process can start HTTP server
function testHTTPServer() {
  return new Promise((resolve) => {
    console.log('\n5️⃣ Testing HTTP server creation...');
    
    const server = http.createServer((req, res) => {
      if (req.url === '/test-health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    
    server.listen(3001, '0.0.0.0', () => {
      console.log('✅ Test server started on port 3001');
      
      // Test the test server
      http.get('http://localhost:3001/test-health', (res) => {
        console.log(`✅ Test server responded with status: ${res.statusCode}`);
        server.close(() => {
          console.log('✅ Test server closed');
          resolve(true);
        });
      }).on('error', (err) => {
        console.log('❌ Test server connection failed:', err.message);
        server.close(() => resolve(false));
      });
    });
    
    server.on('error', (err) => {
      console.log('❌ Test server failed to start:', err.message);
      resolve(false);
    });
  });
}

// Run all tests
async function runDiagnosis() {
  console.log('📊 Environment Information:');
  console.log(`   Node.js version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Working directory: ${process.cwd()}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'unknown'}`);
  
  const results = {
    serverListening: await testServerListening(),
    databaseConnection: await testDatabaseConnection(),
    firebaseConfig: testFirebaseConfig(),
    environmentVariables: testEnvironmentVariables(),
    httpServer: await testHTTPServer()
  };
  
  console.log('\n🎯 Diagnosis Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });
  
  console.log('\n🔧 Recommendations:');
  
  if (!results.serverListening) {
    console.log('- Server is not responding on port 3000');
    console.log('- Check if the application started successfully');
    console.log('- Look for startup errors in application logs');
  }
  
  if (!results.databaseConnection) {
    console.log('- Database connection is failing');
    console.log('- Verify DATABASE_URL is correctly set');
    console.log('- Check if PostgreSQL is accessible from this container');
  }
  
  if (!results.firebaseConfig) {
    console.log('- Firebase configuration is incomplete');
    console.log('- Add missing Firebase environment variables');
    console.log('- Note: Firebase warnings are expected in development');
  }
  
  if (!results.environmentVariables) {
    console.log('- Required environment variables are missing');
    console.log('- Check Docker environment variable configuration');
  }
  
  if (!results.httpServer) {
    console.log('- HTTP server creation is failing');
    console.log('- Possible port binding issues');
    console.log('- Check network configuration');
  }
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the diagnosis
runDiagnosis();