# Authentication Testing Guide

This comprehensive guide covers testing the simplified Firebase authentication system for the BlytzWork platform. It includes unit tests, integration tests, deployment validation, and troubleshooting procedures.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Deployment Validation](#deployment-validation)
6. [Continuous Integration](#continuous-integration)
7. [Test Data Management](#test-data-management)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)

## Overview

The authentication system uses Firebase for user authentication with a simplified configuration approach. The testing suite validates:

- Firebase configuration validation
- Authentication flows (login, register, token refresh)
- Frontend-backend integration
- Error handling scenarios
- WebSocket authentication
- Role-based access control (RBAC)
- Deployment validation

### Key Components Tested

1. **Backend Authentication**
   - [`firebaseConfig-simplified.ts`](../backend/src/config/firebaseConfig-simplified.ts) - Firebase Admin configuration
   - [`firebaseAuth-simplified.ts`](../backend/src/plugins/firebaseAuth-simplified.ts) - Authentication middleware
   - [`auth.ts`](../backend/src/routes/auth.ts) - Authentication endpoints

2. **Frontend Authentication**
   - [`firebase-simplified.ts`](../frontend/src/lib/firebase-simplified.ts) - Firebase client configuration
   - [`auth.ts`](../frontend/src/lib/auth.ts) - Authentication utilities
   - [`EnhancedAuthForm.tsx`](../frontend/src/components/auth/EnhancedAuthForm.tsx) - Authentication UI

## Test Structure

```
├── backend/tests/
│   ├── firebase-config.test.ts      # Firebase configuration tests
│   ├── auth-flow.test.ts           # Authentication flow tests
│   ├── auth-error-scenarios.test.ts # Error handling tests
│   ├── websocket-auth.test.ts       # WebSocket authentication tests
│   ├── rbac.test.ts               # Role-based access control tests
│   └── setup.ts                  # Test setup utilities
├── frontend/tests/
│   ├── firebase-config.test.ts      # Frontend Firebase configuration tests
│   └── auth-flow.test.ts          # Frontend authentication flow tests
├── tests/
│   └── auth-integration.test.ts    # Frontend-backend integration tests
└── scripts/
    ├── validate-auth-deployment.sh  # Deployment validation script
    └── validate-docker-auth.sh    # Docker-specific validation
```

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

2. Set up test environment variables:
```bash
# Copy example environment files
cp .env.example .env.test

# Edit with test values
# Note: Use a separate Firebase project for testing
```

3. Start test database (if running locally):
```bash
docker-compose -f docker-compose.2-database.yml up -d
```

### Running Individual Test Suites

#### Backend Tests

```bash
# Run all backend tests
cd backend && npm test

# Run specific test file
npm test -- firebase-config.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

#### Frontend Tests

```bash
# Run all frontend tests
cd frontend && npm test

# Run specific test file
npm test -- firebase-config.test.ts

# Run tests with coverage
npm test -- --coverage
```

#### Integration Tests

```bash
# Run integration tests (from root)
npm run test:integration

# Run with specific environment
NODE_ENV=test npm run test:integration
```

### Running Tests with Docker

```bash
# Build test containers
docker-compose -f docker-compose.test.yml build

# Run all tests
docker-compose -f docker-compose.test.yml run --rm tests

# Run specific test suite
docker-compose -f docker-compose.test.yml run --rm backend npm test
```

## Test Categories

### 1. Firebase Configuration Tests

**Purpose**: Validate Firebase configuration in both frontend and backend.

**Files**: 
- [`backend/tests/firebase-config.test.ts`](../backend/tests/firebase-config.test.ts)
- [`frontend/tests/firebase-config.test.ts`](../frontend/tests/firebase-config.test.ts)

**Test Cases**:
- Valid configuration with all required variables
- Missing required environment variables
- Invalid environment variables (template syntax)
- Private key handling with newlines
- Partial configuration with optional variables

**Example Test**:
```typescript
it('should return valid configuration when all required variables are set', () => {
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
  process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\n...';
  
  const result = validateFirebaseConfig();
  
  expect(result.isValid).toBe(true);
  expect(result.config.projectId).toBe('test-project');
});
```

### 2. Authentication Flow Tests

**Purpose**: Test complete authentication flows including login, registration, and token management.

**Files**:
- [`backend/tests/auth-flow.test.ts`](../backend/tests/auth-flow.test.ts)
- [`frontend/tests/auth-flow.test.ts`](../frontend/tests/auth-flow.test.ts)

**Backend Test Cases**:
- Authentication middleware validation
- User profile management
- Password reset flow
- User synchronization
- Custom token generation

**Frontend Test Cases**:
- User sign-in flow
- User registration flow
- Sign-out functionality
- Error message handling
- Token refresh scenarios

**Example Test**:
```typescript
it('should sign in user successfully', async () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

  const result = await signInUser('test@example.com', 'password123');

  expect(result).toEqual({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  });
});
```

### 3. Integration Tests

**Purpose**: Test end-to-end authentication flows between frontend and backend.

**File**: [`tests/auth-integration.test.ts`](../tests/auth-integration.test.ts)

**Test Cases**:
- Complete authentication flow from frontend to backend
- User registration and profile creation
- Password reset flow
- Token management and refresh
- Cross-origin authentication
- Concurrent authentication requests
- Authentication state consistency

**Example Test**:
```typescript
it('should handle complete authentication flow from frontend to backend', async () => {
  // Mock Firebase authentication
  mockFirebaseAuth.verifyIdToken.mockResolvedValue({
    uid: testUser.id,
    email: testUser.email,
  });

  // Test authenticated API request
  const response = await request(app.server)
    .get('/api/auth/profile')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  expect(response.body).toHaveProperty('success', true);
  expect(response.body.data).toHaveProperty('email', testUser.email);
});
```

### 4. Error Scenario Tests

**Purpose**: Test error handling and edge cases in the authentication system.

**File**: [`backend/tests/auth-error-scenarios.test.ts`](../backend/tests/auth-error-scenarios.test.ts)

**Test Cases**:
- Firebase configuration errors
- Token validation errors (expired, invalid, revoked)
- Database connection errors
- Network and service errors
- Input validation errors
- Concurrent request errors
- Security error scenarios
- Recovery and fallback scenarios

**Example Test**:
```typescript
it('should handle expired ID token', async () => {
  mockFirebaseAuth.verifyIdToken.mockRejectedValue({
    code: 'auth/id-token-expired',
    message: 'Firebase ID token has expired',
  });

  const response = await request(app.server)
    .get('/api/auth/profile')
    .set('Authorization', 'Bearer expired-token')
    .expect(401);

  expect(response.body).toHaveProperty('error', 'Invalid or expired token');
});
```

### 5. WebSocket Authentication Tests

**Purpose**: Test real-time authentication for chat and other WebSocket features.

**File**: [`backend/tests/websocket-auth.test.ts`](../backend/tests/websocket-auth.test.ts)

**Test Cases**:
- WebSocket connection authentication
- Authenticated WebSocket events
- WebSocket security
- Concurrent connections
- Error handling
- Performance under load

**Example Test**:
```typescript
it('should authenticate user with valid token', (done) => {
  mockFirebaseAuth.verifyIdToken.mockResolvedValue({
    uid: testUser.id,
    email: testUser.email,
  });

  clientSocket = ClientIO(`http://localhost:${port}`, {
    auth: { token: 'valid-firebase-token' }
  });

  clientSocket.on('connect', () => {
    expect(clientSocket.connected).toBe(true);
    done();
  });
});
```

### 6. Role-Based Access Control Tests

**Purpose**: Test that users can only access resources appropriate to their role.

**File**: [`backend/tests/rbac.test.ts`](../backend/tests/rbac.test.ts)

**Test Cases**:
- VA role access control
- Company role access control
- Admin role access control
- Cross-role access prevention
- Role-based resource access
- Role validation in API endpoints

**Example Test**:
```typescript
it('should prevent VA from accessing company-only endpoints', async () => {
  mockFirebaseAuth.verifyIdToken.mockResolvedValue({
    uid: vaUser.id,
    email: vaUser.email,
  });

  const response = await request(app.server)
    .post('/api/company')
    .set('Authorization', 'Bearer va-token')
    .send({ name: 'Unauthorized Company' })
    .expect(403);

  expect(response.body).toHaveProperty('error');
});
```

## Deployment Validation

### Automated Validation Scripts

#### General Deployment Validation

**Script**: [`scripts/validate-auth-deployment.sh`](../scripts/validate-auth-deployment.sh)

**Usage**:
```bash
# Run comprehensive validation
./scripts/validate-auth-deployment.sh

# Run specific validation
./scripts/validate-auth-deployment.sh production
./scripts/validate-auth-deployment.sh firebase
./scripts/validate-auth-deployment.sh database
```

**Validates**:
- Environment variables
- Firebase configuration
- Service health
- Database connectivity
- API endpoints
- CORS configuration
- WebSocket accessibility

#### Docker Deployment Validation

**Script**: [`scripts/validate-docker-auth.sh`](../scripts/validate-docker-auth.sh)

**Usage**:
```bash
# Run comprehensive Docker validation
./scripts/validate-docker-auth.sh

# Check container status
./scripts/validate-docker-auth.sh status

# Show container logs
./scripts/validate-docker-auth.sh logs backend 100

# Test specific components
./scripts/validate-docker-auth.sh firebase
./scripts/validate-docker-auth.sh connectivity
```

**Validates**:
- Docker container status
- Inter-container communication
- Firebase configuration in containers
- Environment variables in containers
- Database connectivity from containers
- Container health checks

### Manual Validation Checklist

#### Pre-Deployment Checklist

- [ ] All Firebase environment variables are set
- [ ] Firebase project is correctly configured
- [ ] Database schema is up to date
- [ ] SSL certificates are valid
- [ ] CORS configuration is correct
- [ ] Rate limiting is configured
- [ ] Health checks are implemented

#### Post-Deployment Checklist

- [ ] Services are running and accessible
- [ ] Authentication endpoints respond correctly
- [ ] WebSocket connections work
- [ ] Database connectivity is stable
- [ ] Error logs are clean
- [ ] Performance metrics are within limits
- [ ] Security headers are present

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Authentication Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm test -- --coverage
      
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
      
  deployment-validation:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend, integration-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: ./scripts/validate-auth-deployment.sh production
```

### Test Coverage Requirements

- **Backend**: Minimum 90% coverage for authentication-related files
- **Frontend**: Minimum 85% coverage for authentication-related files
- **Integration**: 100% coverage for critical authentication flows

## Test Data Management

### Test Database Strategy

1. **Isolation**: Each test suite uses a separate test database
2. **Cleanup**: Test data is cleaned up after each test
3. **Factories**: Use test factories for consistent test data
4. **Fixtures**: Pre-defined test data for complex scenarios

### Example Test Setup

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset test database
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  });
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await prisma.user.deleteMany();
});
```

## Performance Testing

### Load Testing Authentication

**Tool**: Artillery.js

**Configuration** (`auth-load-test.yml`):
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Authentication Load Test"
    weight: 100
    flow:
      - post:
          url: "/api/auth/profile"
          headers:
            Authorization: "Bearer {{ token }}"
          capture:
            - json: "$.success"
              as: "success"
```

**Run Load Test**:
```bash
artillery run auth-load-test.yml
```

### Performance Metrics

- **Response Time**: < 200ms for authentication endpoints
- **Throughput**: > 100 requests/second
- **Error Rate**: < 0.1%
- **Memory Usage**: < 512MB for authentication services

## Security Testing

### Authentication Security Tests

1. **Token Validation**
   - Test expired tokens
   - Test invalid signatures
   - Test tampered tokens
   - Test revoked tokens

2. **Input Validation**
   - SQL injection attempts
   - XSS attempts
   - Buffer overflow attempts
   - Malformed input

3. **Rate Limiting**
   - Test brute force protection
   - Test DDoS protection
   - Test concurrent request limits

4. **Session Management**
   - Test session fixation
   - Test session hijacking
   - Test concurrent sessions

### Security Testing Tools

```bash
# OWASP ZAP for security scanning
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3001/api/auth

# SQLMap for SQL injection testing
sqlmap -u "http://localhost:3001/api/auth/profile" \
  --headers="Authorization: Bearer test-token" \
  --level=3 --risk=3
```

## Best Practices

### Test Writing

1. **Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange
   const testData = { email: 'test@example.com', password: 'password123' };
   mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
   
   // Act
   const result = await signInUser(testData.email, testData.password);
   
   // Assert
   expect(result).toEqual(expectedResult);
   ```

2. **Descriptive Test Names**
   ```typescript
   it('should reject authentication with expired token', async () => {
     // Test implementation
   });
   ```

3. **Test Isolation**
   - Each test should be independent
   - Use beforeEach/afterEach for cleanup
   - Avoid shared state between tests

4. **Mocking Strategy**
   - Mock external dependencies (Firebase, database)
   - Use consistent mock data
   - Reset mocks between tests

### Continuous Testing

1. **Pre-commit Hooks**
   ```bash
   # .husky/pre-commit
   npm run test:unit && npm run lint
   ```

2. **Pre-push Hooks**
   ```bash
   # .husky/pre-push
   npm run test:integration
   ```

3. **Scheduled Tests**
   - Run full test suite nightly
   - Run performance tests weekly
   - Run security scans monthly

## Troubleshooting

### Common Test Issues

1. **Firebase Configuration Errors**
   - Check environment variables
   - Verify Firebase project settings
   - Ensure service account permissions

2. **Database Connection Issues**
   - Check database is running
   - Verify connection string
   - Check network connectivity

3. **Timeout Issues**
   - Increase test timeout values
   - Check for infinite loops
   - Verify async/await usage

4. **Mock Failures**
   - Ensure mocks are properly configured
   - Check mock return values
   - Verify mock reset between tests

For detailed troubleshooting, see [Authentication Troubleshooting Guide](AUTHENTICATION_TROUBLESHOOTING.md).