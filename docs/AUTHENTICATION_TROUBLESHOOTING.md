# Authentication Troubleshooting Guide

This guide provides comprehensive troubleshooting steps for common authentication issues in the BlytzWork platform's simplified Firebase authentication system.

## Table of Contents

1. [Quick Diagnosis](#quick-diagnosis)
2. [Firebase Configuration Issues](#firebase-configuration-issues)
3. [Authentication Flow Problems](#authentication-flow-problems)
4. [Token Issues](#token-issues)
5. [Database Connection Problems](#database-connection-problems)
6. [WebSocket Authentication Issues](#websocket-authentication-issues)
7. [Role-Based Access Control Problems](#role-based-access-control-problems)
8. [Deployment Issues](#deployment-issues)
9. [Performance Issues](#performance-issues)
10. [Security Concerns](#security-concerns)
11. [Debugging Tools](#debugging-tools)

## Quick Diagnosis

### Initial Health Check

Run the comprehensive validation script to identify issues:

```bash
# General deployment validation
./scripts/validate-auth-deployment.sh comprehensive

# Docker-specific validation
./scripts/validate-docker-auth.sh comprehensive
```

### Common Symptoms and Quick Fixes

| Symptom | Likely Cause | Quick Fix |
|----------|---------------|------------|
| Users can't log in | Firebase configuration missing | Check environment variables |
| 401 errors on API calls | Token expired/invalid | Refresh token or re-authenticate |
| Database connection errors | Database down or wrong credentials | Check database status and connection string |
| WebSocket connection fails | Authentication middleware issue | Verify WebSocket authentication setup |
| CORS errors | Frontend/backend origin mismatch | Update CORS configuration |

## Firebase Configuration Issues

### Environment Variables Not Set

**Symptoms**:
- `Firebase Admin configuration is invalid` error
- `Firebase configuration is invalid` error
- Authentication endpoints return 500 errors

**Diagnosis**:
```bash
# Check required environment variables
echo "FIREBASE_PROJECT_ID: $FIREBASE_PROJECT_ID"
echo "FIREBASE_CLIENT_EMAIL: $FIREBASE_CLIENT_EMAIL"
echo "FIREBASE_PRIVATE_KEY: $FIREBASE_PRIVATE_KEY"
echo "NEXT_PUBLIC_FIREBASE_API_KEY: $NEXT_PUBLIC_FIREBASE_API_KEY"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: $NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID: $NEXT_PUBLIC_FIREBASE_PROJECT_ID"
```

**Solution**:
1. Set missing environment variables:
```bash
# Backend
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Frontend
export NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

2. For Docker, update `.env` file or Docker secrets:
```bash
# docker-compose.yml
environment:
  - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
  - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
  - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
```

### Template Syntax in Environment Variables

**Symptoms**:
- `Invalid environment variables (contain template syntax)` error
- Configuration validation fails

**Diagnosis**:
```bash
# Check for template syntax
env | grep -E '\$\{\{|REPLACE_WITH_|\${environment'
```

**Solution**:
Replace template syntax with actual values:
```bash
# Wrong
FIREBASE_PROJECT_ID="${{ secrets.FIREBASE_PROJECT_ID }}"

# Correct
FIREBASE_PROJECT_ID="actual-project-id"
```

### Firebase Service Account Issues

**Symptoms**:
- `Failed to initialize Firebase Admin` error
- Permission denied errors
- Token verification failures

**Diagnosis**:
```bash
# Test Firebase Admin initialization
cd backend && node -e "
const { initializeFirebaseAdmin } = require('./dist/config/firebaseConfig-simplified.js');
try {
  const admin = initializeFirebaseAdmin();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}
"
```

**Solution**:
1. Verify service account permissions:
   - Ensure service account has "Firebase Admin" role
   - Check service account is active
   - Verify private key format

2. Regenerate service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Update `FIREBASE_PRIVATE_KEY` environment variable

3. Test with Firebase Admin SDK directly:
```bash
# Install Firebase Admin CLI
npm install -g firebase-admin

# Test service account
firebase admin auth:list-users --project your-project-id
```

## Authentication Flow Problems

### User Registration Fails

**Symptoms**:
- Registration returns error
- User not created in database
- Email already in use error for new users

**Diagnosis**:
```bash
# Check Firebase Auth settings
firebase auth:list --project your-project-id

# Test user creation
firebase auth:create --project your-project-id test@example.com
```

**Solution**:
1. Check Firebase Auth configuration:
   - Enable Email/Password authentication
   - Verify email providers are enabled
   - Check email/password policies

2. Check database connection:
```bash
# Test database connectivity
cd backend && node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err))
  .finally(() => prisma.\$disconnect());
"
```

3. Verify user synchronization:
```bash
# Test user sync endpoint
curl -X POST http://localhost:3001/api/auth/sync \
  -H "Authorization: Bearer your-firebase-token" \
  -H "Content-Type: application/json" \
  -d '{"uid": "test-uid", "email": "test@example.com"}'
```

### Login Failures

**Symptoms**:
- Invalid credentials error
- User not found error
- Authentication loop

**Diagnosis**:
```bash
# Check if user exists in Firebase Auth
firebase auth:get-user test@example.com --project your-project-id

# Check if user exists in database
cd backend && node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'test@example.com' } })
  .then(user => user ? console.log('✅ User found in database') : console.log('❌ User not found in database'))
  .finally(() => prisma.\$disconnect());
"
```

**Solution**:
1. Verify user exists in both Firebase Auth and database
2. Check email/password combination
3. Ensure user account is not disabled
4. Verify email is verified (if required)

## Token Issues

### Token Expiration

**Symptoms**:
- 401 errors after some time
- Users logged out unexpectedly
- API calls fail intermittently

**Diagnosis**:
```bash
# Decode JWT token to check expiration
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d | jq .

# Check token expiration in logs
docker logs backend-1 | grep -i "token.*expir"
```

**Solution**:
1. Implement automatic token refresh:
```typescript
// Frontend token refresh
const refreshAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true); // Force refresh
    return token;
  }
};
```

2. Handle token expiration gracefully:
```typescript
// Backend token validation
try {
  const decodedToken = await firebaseAuth.verifyIdToken(token);
  // Process request
} catch (error) {
  if (error.code === 'auth/id-token-expired') {
    return reply.code(401).send({ 
      error: 'Token expired', 
      code: 'TOKEN_EXPIRED' 
    });
  }
}
```

### Invalid Token Format

**Symptoms**:
- `Decoding Firebase ID token failed` error
- Malformed token errors
- Authorization header parsing errors

**Diagnosis**:
```bash
# Check authorization header format
curl -v http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer your-token"

# Check token structure
echo "your-token" | awk -F'.' '{print "Header:", $1, "Payload:", $2, "Signature:", $3}'
```

**Solution**:
1. Ensure proper token format:
```typescript
// Frontend - get token properly
const token = await user.getIdToken();
localStorage.setItem('authToken', token);

// Backend - parse authorization header correctly
const authHeader = request.headers.authorization;
const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
```

2. Validate token before sending:
```typescript
// Frontend token validation
const validateToken = (token) => {
  try {
    const parts = token.split('.');
    return parts.length === 3; // JWT should have 3 parts
  } catch {
    return false;
  }
};
```

## Database Connection Problems

### Connection Timeout

**Symptoms**:
- Database connection timeout errors
- Prisma connection errors
- Service startup failures

**Diagnosis**:
```bash
# Test database connectivity
docker exec postgres-1 pg_isready

# Check database logs
docker logs postgres-1 | tail -50

# Test connection string
psql "postgresql://user:password@localhost:5432/database" -c "SELECT 1;"
```

**Solution**:
1. Check database is running:
```bash
docker-compose -f docker-compose.2-database.yml ps
docker-compose -f docker-compose.2-database.yml logs postgres
```

2. Verify connection string:
```bash
# Test connection string
echo $DATABASE_URL
cd backend && npx prisma db pull --force
```

3. Check network connectivity:
```bash
# Test from backend container
docker exec backend-1 ping postgres-1
docker exec backend-1 telnet postgres-1 5432
```

### Schema Mismatch

**Symptoms**:
- Prisma validation errors
- Column not found errors
- Type mismatch errors

**Diagnosis**:
```bash
# Check database schema
cd backend && npx prisma db pull
npx prisma generate

# Compare with schema file
diff prisma/schema.prisma prisma/migrations/
```

**Solution**:
1. Update database schema:
```bash
cd backend && npx prisma migrate deploy
npx prisma generate
```

2. Reset database (development only):
```bash
cd backend && npx prisma migrate reset
```

## WebSocket Authentication Issues

### Connection Failures

**Symptoms**:
- WebSocket connection rejected
- Authentication errors on connect
- Socket.io connection timeouts

**Diagnosis**:
```bash
# Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:3001/socket.io/

# Check WebSocket logs
docker logs backend-1 | grep -i "socket\|websocket"
```

**Solution**:
1. Verify WebSocket authentication middleware:
```typescript
// Check authentication in WebSocket middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    // ... rest of authentication
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

2. Check CORS configuration for WebSockets:
```typescript
// WebSocket CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
```

### Authentication During WebSocket Events

**Symptoms**:
- WebSocket events fail with authentication errors
- User data not available in socket handlers
- Permission errors during events

**Diagnosis**:
```bash
# Test WebSocket authentication
cd frontend && node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001', {
  auth: { token: 'your-test-token' }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
"
```

**Solution**:
1. Ensure user data is attached to socket:
```typescript
// In authentication middleware
socket.data.user = {
  uid: user.id,
  email: user.email,
  role: user.role
};

// In event handlers
socket.on('some-event', (data) => {
  const user = socket.data.user;
  if (!user) {
    socket.emit('error', { message: 'Authentication required' });
    return;
  }
  // Process event
});
```

## Role-Based Access Control Problems

### Permission Denied Errors

**Symptoms**:
- 403 Forbidden errors
- Access denied to resources
- Role validation failures

**Diagnosis**:
```bash
# Test user role
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer your-token" | jq '.data.role'

# Check role-based access
curl -X POST http://localhost:3001/api/company/jobs \
  -H "Authorization: Bearer va-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job"}'
```

**Solution**:
1. Verify role assignment:
```typescript
// Check user role in database
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { role: true }
});

if (!user || !['va', 'company', 'admin'].includes(user.role)) {
  return reply.code(403).send({ error: 'Invalid role' });
}
```

2. Implement role-based middleware:
```typescript
const requireRole = (allowedRoles) => async (request, reply) => {
  const user = request.user;
  
  if (!allowedRoles.includes(user.role)) {
    return reply.code(403).send({ 
      error: 'Insufficient permissions',
      requiredRole: allowedRoles,
      userRole: user.role
    });
  }
};
```

### Cross-Role Access Issues

**Symptoms**:
- Users accessing resources they shouldn't
- Role validation bypassed
- Privilege escalation

**Diagnosis**:
```bash
# Test cross-role access
# VA trying to access company endpoints
curl -X POST http://localhost:3001/api/company \
  -H "Authorization: Bearer va-token" \
  -d '{"name": "Fake Company"}'

# Company trying to access VA endpoints
curl -X POST http://localhost:3001/api/va/profile \
  -H "Authorization: Bearer company-token" \
  -d '{"name": "Fake VA"}'
```

**Solution**:
1. Add resource ownership checks:
```typescript
// Check resource ownership
const checkResourceOwnership = async (userId, resourceId, resourceType) => {
  switch (resourceType) {
    case 'company':
      const company = await prisma.company.findUnique({
        where: { id: resourceId }
      });
      return company?.userId === userId;
      
    case 'vaProfile':
      const vaProfile = await prisma.vAProfile.findUnique({
        where: { id: resourceId }
      });
      return vaProfile?.userId === userId;
      
    default:
      return false;
  }
};
```

## Deployment Issues

### Environment Variable Problems in Production

**Symptoms**:
- Authentication works in development but not production
- Environment variables not loaded
- Template syntax errors in production

**Diagnosis**:
```bash
# Check production environment variables
docker exec backend-1 printenv | grep FIREBASE
docker exec frontend-1 printenv | grep FIREBASE

# Check for template syntax
docker exec backend-1 printenv | grep -E '\$\{\{|REPLACE_WITH_'
```

**Solution**:
1. Verify environment variables in deployment:
```bash
# Dokploy environment variables
dokploy logs app-name

# Kubernetes environment variables
kubectl describe pod backend-pod-name

# Docker Compose environment
docker-compose config
```

2. Use proper environment variable injection:
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
```

### SSL/HTTPS Issues

**Symptoms**:
- Mixed content errors
- WebSocket connection failures over HTTPS
- Certificate errors

**Diagnosis**:
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test HTTPS endpoints
curl -i https://your-domain.com/api/auth/profile

# Check WebSocket over HTTPS
wss://your-domain.com/socket.io/
```

**Solution**:
1. Configure SSL properly:
```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

2. Configure WebSocket for HTTPS:
```typescript
// WebSocket with HTTPS
const io = new Server(httpsServer, {
  cors: {
    origin: 'https://your-domain.com',
    credentials: true
  }
});
```

## Performance Issues

### Slow Authentication

**Symptoms**:
- Login takes too long
- Token verification is slow
- Database queries are slow

**Diagnosis**:
```bash
# Measure authentication response time
time curl -X POST http://localhost:3001/api/auth/sync \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"uid": "test", "email": "test@example.com"}'

# Check database query performance
cd backend && npx prisma studio --browser none
```

**Solution**:
1. Add database indexes:
```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role
  createdAt DateTime @default(now())
  
  @@index([email])
  @@index([role])
}
```

2. Implement caching:
```typescript
// Cache Firebase token verification
const tokenCache = new Map();

const verifyTokenWithCache = async (token) => {
  if (tokenCache.has(token)) {
    return tokenCache.get(token);
  }
  
  const decodedToken = await firebaseAuth.verifyIdToken(token);
  tokenCache.set(token, decodedToken);
  
  // Clear cache after token expires
  setTimeout(() => tokenCache.delete(token), 3600000); // 1 hour
  
  return decodedToken;
};
```

### Memory Leaks

**Symptoms**:
- Memory usage increases over time
- Server crashes after some time
- Performance degrades

**Diagnosis**:
```bash
# Monitor memory usage
docker stats backend-1

# Check for memory leaks in Node.js
node --inspect backend/dist/server.js
# Then use Chrome DevTools Memory tab
```

**Solution**:
1. Fix memory leaks in authentication:
```typescript
// Clean up resources properly
const cleanup = () => {
  tokenCache.clear();
  if (prisma) {
    prisma.$disconnect();
  }
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
```

2. Optimize database connections:
```typescript
// Use connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## Security Concerns

### Token Theft

**Symptoms**:
- Unauthorized access to user accounts
- Suspicious activity in logs
- Multiple sessions for same user

**Diagnosis**:
```bash
# Check for suspicious IP addresses
docker logs backend-1 | grep "Authorization" | awk '{print $1}' | sort | uniq -c

# Monitor failed authentication attempts
docker logs backend-1 | grep "401\|403" | tail -20
```

**Solution**:
1. Implement token blacklisting:
```typescript
const revokedTokens = new Set();

const revokeToken = (token) => {
  revokedTokens.add(token);
};

const isTokenRevoked = (token) => {
  return revokedTokens.has(token);
};
```

2. Add device tracking:
```typescript
const deviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  return crypto.createHash('sha256').update(`${userAgent}:${ip}`).digest('hex');
};
```

### Brute Force Attacks

**Symptoms**:
- High number of failed login attempts
- Account lockout issues
- Performance degradation

**Diagnosis**:
```bash
# Check for brute force patterns
docker logs backend-1 | grep "auth.*fail" | awk '{print $1}' | sort | uniq -c | sort -nr

# Monitor rate limiting
curl -X POST http://localhost:3001/api/auth/sync \
  -H "Authorization: Bearer invalid-token" \
  -w "%{http_code}\n"
```

**Solution**:
1. Implement rate limiting:
```typescript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
});
```

2. Add account lockout:
```typescript
const failedAttempts = new Map();

const checkAccountLockout = (email) => {
  const attempts = failedAttempts.get(email) || 0;
  if (attempts >= 5) {
    return { locked: true, unlockTime: Date.now() + 30 * 60 * 1000 }; // 30 minutes
  }
  return { locked: false };
};
```

## Debugging Tools

### Authentication Debug Scripts

1. **Firebase Configuration Debug**:
```bash
# Run Firebase debug script
./scripts/debug-auth.sh
```

2. **Token Debug**:
```bash
# Decode and analyze JWT token
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d | jq .
```

3. **Database Debug**:
```bash
# Check user in database
cd backend && node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ take: 5 })
  .then(users => console.log(JSON.stringify(users, null, 2)))
  .finally(() => prisma.\$disconnect());
"
```

### Logging Configuration

1. **Enhanced Authentication Logging**:
```typescript
// Add detailed logging
const logger = require('pino')();

export const verifyAuth = async (request, reply) => {
  const startTime = Date.now();
  const authHeader = request.headers.authorization;
  
  logger.info({
    event: 'auth_attempt',
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    hasAuthHeader: !!authHeader
  });
  
  try {
    // ... authentication logic
    logger.info({
      event: 'auth_success',
      userId: user.id,
      duration: Date.now() - startTime
    });
  } catch (error) {
    logger.error({
      event: 'auth_failure',
      error: error.message,
      code: error.code,
      duration: Date.now() - startTime
    });
  }
};
```

2. **Request/Response Logging**:
```typescript
// Log all authentication requests
app.addHook('onRequest', (request, reply, done) => {
  if (request.url.startsWith('/api/auth')) {
    logger.info({
      method: request.method,
      url: request.url,
      headers: request.headers,
      timestamp: new Date().toISOString()
    });
  }
  done();
});
```

### Monitoring and Alerting

1. **Authentication Metrics**:
```typescript
// Track authentication metrics
const authMetrics = {
  totalAttempts: 0,
  successfulLogins: 0,
  failedLogins: 0,
  tokenRefreshes: 0
};

const trackAuthEvent = (event) => {
  authMetrics.totalAttempts++;
  authMetrics[event]++;
  
  // Send to monitoring service
  sendMetric('auth_event', { event, count: authMetrics[event] });
};
```

2. **Health Check Endpoints**:
```typescript
// Detailed health check
app.get('/health/auth', async (request, reply) => {
  try {
    // Test Firebase connection
    await firebaseAuth.getUser('test');
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase: 'ok',
        database: 'ok'
      }
    };
  } catch (error) {
    return reply.code(503).send({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## Emergency Procedures

### Complete Authentication Failure

1. **Immediate Response**:
   ```bash
# Check service status
   ./scripts/validate-auth-deployment.sh
   
   # Restart services if needed
   docker-compose restart backend frontend
   ```

2. **Rollback Plan**:
   ```bash
   # Rollback to previous version
   git checkout previous-commit-tag
   docker-compose up -d --force-recreate
   ```

3. **Emergency Mode**:
   ```bash
   # Disable authentication (emergency only)
   export DISABLE_AUTH=true
   docker-compose up -d
   ```

### Security Incident Response

1. **Identify Breach**:
   ```bash
   # Check for suspicious activity
   docker logs backend-1 | grep -E "(401|403|500)" | tail -100
   
   # Block suspicious IPs
   iptables -A INPUT -s SUSPICIOUS_IP -j DROP
   ```

2. **Contain Damage**:
   ```bash
   # Revoke all active tokens
   ./scripts/revoke-all-tokens.sh
   
   # Force password reset for all users
   firebase auth:update-all-users --project your-project-id --password-reset
   ```

3. **Post-Incident**:
   ```bash
   # Analyze logs
   ./scripts/analyze-security-incident.sh
   
   # Update security measures
   ./scripts/harden-authentication.sh
   ```

This troubleshooting guide should help resolve most authentication issues. For additional support, refer to the [Authentication Testing Guide](AUTHENTICATION_TESTING_GUIDE.md) or create an issue in the project repository.