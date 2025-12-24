# Inter-Service Communication Design

## Communication Patterns Overview

### 1. Synchronous Communication (HTTP/REST)
**Use Cases**: Immediate response required, data validation, real-time operations
**Examples**: 
- User validation before job application
- Payment processing with immediate confirmation
- Profile data retrieval

### 2. Asynchronous Communication (Events/Messaging)
**Use Cases**: Event notifications, data synchronization, analytics, audit logs
**Examples**:
- User profile updated → Notify all services
- Job posted → Notify matching algorithm
- Payment completed → Update analytics

## API Gateway Configuration

### Traefik Routes Setup
```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@blytz.work"
    ports:
      - "80:80"
      - "443:443"
    labels:
      - "traefik.http.routers.api.rule=Host(`api.blytz.work`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"

  # User Service
  user-service:
    build: ./services/user-service
    environment:
      - DATABASE_URL=${USERS_DB_URL}
      - REDIS_URL=${REDIS_URL}
    labels:
      - "traefik.http.routers.users.rule=Host(`api.blytz.work`) && PathPrefix(`/api/users`)"
      - "traefik.http.routers.users.middlewares=users-stripprefix"
      - "traefik.http.middlewares.users-stripprefix.stripprefix.prefixes=/api/users"

  # Marketplace Service  
  marketplace-service:
    build: ./services/marketplace-service
    environment:
      - DATABASE_URL=${MARKETPLACE_DB_URL}
      - REDIS_URL=${REDIS_URL}
    labels:
      - "traefik.http.routers.marketplace.rule=Host(`api.blytz.work`) && PathPrefix(`/api/jobs`)"
      - "traefik.http.routers.marketplace.middlewares=marketplace-stripprefix"
      - "traefik.http.middlewares.marketplace-stripprefix.stripprefix.prefixes=/api/jobs"
```

## Service Communication Interfaces

### 1. User Service Client
```typescript
// shared/clients/UserServiceClient.ts
export class UserServiceClient {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheTTL = 300000; // 5 minutes

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
  }

  async getUserById(userId: string): Promise<SharedUser | null> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!response.ok) return null;
      
      const user = await response.json();
      this.cache.set(userId, { data: user, timestamp: Date.now() });
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  async validateUser(userId: string, requiredRole?: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    if (requiredRole && user.role !== requiredRole) return false;
    return true;
  }

  async getBasicProfile(userId: string): Promise<SharedUser | null> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/profile`);
    return response.ok ? response.json() : null;
  }
}
```

### 2. Marketplace Service Client
```typescript
// shared/clients/MarketplaceServiceClient.ts
export class MarketplaceServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://marketplace-service:3002';
  }

  async getJobPosting(jobId: string): Promise<JobPosting | null> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    return response.ok ? response.json() : null;
  }

  async getJobsByCompany(companyId: string): Promise<JobPosting[]> {
    const response = await fetch(`${this.baseUrl}/jobs?company=${companyId}`);
    return response.ok ? response.json() : [];
  }

  async submitProposal(proposalData: CreateProposalRequest): Promise<Proposal | null> {
    const response = await fetch(`${this.baseUrl}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    });
    return response.ok ? response.json() : null;
  }
}
```

### 3. Payments Service Client
```typescript
// shared/clients/PaymentsServiceClient.ts
export class PaymentsServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PAYMENTS_SERVICE_URL || 'http://payments-service:3004';
  }

  async createPaymentIntent(paymentData: PaymentIntentRequest): Promise<PaymentIntent | null> {
    const response = await fetch(`${this.baseUrl}/payments/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return response.ok ? response.json() : null;
  }

  async processPayment(paymentId: string): Promise<Payment | null> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/process`, {
      method: 'POST'
    });
    return response.ok ? response.json() : null;
  }

  async refundPayment(paymentId: string, reason: string): Promise<Refund | null> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return response.ok ? response.json() : null;
  }
}
```

## Event-Driven Communication

### 1. Event Publisher (User Service)
```typescript
// services/user-service/src/events/UserEventPublisher.ts
export class UserEventPublisher {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async publishUserCreated(user: User): Promise<void> {
    const event: UserEvent = {
      type: 'USER_CREATED',
      userId: user.id,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        verificationLevel: user.verificationLevel
      },
      timestamp: new Date()
    };

    await this.redis.publish('user.events', JSON.stringify(event));
    console.log(`Published USER_CREATED event for user ${user.id}`);
  }

  async publishUserUpdated(user: User): Promise<void> {
    const event: UserEvent = {
      type: 'USER_UPDATED',
      userId: user.id,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        verificationLevel: user.verificationLevel
      },
      timestamp: new Date()
    };

    await this.redis.publish('user.events', JSON.stringify(event));
    console.log(`Published USER_UPDATED event for user ${user.id}`);
  }

  async publishUserDeleted(userId: string): Promise<void> {
    const event: UserEvent = {
      type: 'USER_DELETED',
      userId,
      data: { id: userId },
      timestamp: new Date()
    };

    await this.redis.publish('user.events', JSON.stringify(event));
    console.log(`Published USER_DELETED event for user ${userId}`);
  }
}
```

### 2. Event Subscriber (Marketplace Service)
```typescript
// services/marketplace-service/src/events/UserEventSubscriber.ts
export class UserEventSubscriber {
  private redis: Redis;
  private userService: UserServiceClient;

  constructor(redis: Redis, userService: UserServiceClient) {
    this.redis = redis;
    this.userService = userService;
  }

  async subscribe(): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe('user.events');

    subscriber.on('message', async (channel, message) => {
      try {
        const event: UserEvent = JSON.parse(message);
        await this.handleUserEvent(event);
      } catch (error) {
        console.error('Failed to handle user event:', error);
      }
    });
  }

  private async handleUserEvent(event: UserEvent): Promise<void> {
    switch (event.type) {
      case 'USER_CREATED':
        await this.handleUserCreated(event);
        break;
      case 'USER_UPDATED':
        await this.handleUserUpdated(event);
        break;
      case 'USER_DELETED':
        await this.handleUserDeleted(event);
        break;
    }
  }

  private async handleUserCreated(event: UserEvent): Promise<void> {
    // Cache user data in marketplace service
    await this.userService.cacheUserData(event.data);
    console.log(`Cached new user ${event.userId} in marketplace service`);
  }

  private async handleUserUpdated(event: UserEvent): Promise<void> {
    // Update cached user data
    await this.userService.updateCachedUserData(event.data);
    console.log(`Updated user ${event.userId} cache in marketplace service`);
  }

  private async handleUserDeleted(event: UserEvent): Promise<void> {
    // Remove user's job postings, proposals, etc.
    await this.cleanupUserData(event.userId);
    console.log(`Cleaned up data for deleted user ${event.userId}`);
  }
}
```

## Circuit Breaker Pattern

### 1. Resilience Library
```typescript
// shared/resilience/CircuitBreaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN', 
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly timeout: number;
  private readonly successThreshold: number;

  constructor(options: {
    failureThreshold?: number;
    timeout?: number;
    successThreshold?: number;
  } = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.successThreshold = options.successThreshold || 3;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 2. Resilient Service Client
```typescript
// shared/clients/ResilientUserServiceClient.ts
export class ResilientUserServiceClient extends UserServiceClient {
  private circuitBreaker: CircuitBreaker;
  private retryCount = 3;

  constructor() {
    super();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      timeout: 60000,
      successThreshold: 3
    });
  }

  async getUserById(userId: string): Promise<SharedUser | null> {
    return this.circuitBreaker.execute(async () => {
      return this.withRetry(() => super.getUserById(userId));
    });
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retryCount) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Service Health Monitoring

### 1. Health Check Endpoint
```typescript
// shared/health/HealthChecker.ts
export class HealthChecker {
  private dependencies: ServiceDependency[] = [];

  addDependency(dependency: ServiceDependency): void {
    this.dependencies.push(dependency);
  }

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled(
      this.dependencies.map(dep => this.checkDependency(dep))
    );

    const results = checks.map((check, index) => ({
      service: this.dependencies[index].name,
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason
    }));

    const allHealthy = results.every(r => r.status === 'healthy');
    const unhealthyServices = results.filter(r => r.status === 'unhealthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      services: results,
      unhealthyServices: unhealthyServices.map(s => s.service)
    };
  }

  private async checkDependency(dependency: ServiceDependency): Promise<any> {
    const response = await fetch(`${dependency.url}/health`, {
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`Service ${dependency.name} returned ${response.status}`);
    }
    
    return response.json();
  }
}

interface ServiceDependency {
  name: string;
  url: string;
  timeout?: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: Array<{
    service: string;
    status: string;
    details?: any;
  }>;
  unhealthyServices?: string[];
}
```

## Distributed Tracing

### 1. Request Tracing
```typescript
// shared/tracing/Tracer.ts
export class Tracer {
  private static instance: Tracer;
  private traceId: string;

  static getInstance(): Tracer {
    if (!Tracer.instance) {
      Tracer.instance = new Tracer();
    }
    return Tracer.instance;
  }

  generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  startTrace(traceId?: string): string {
    this.traceId = traceId || this.generateTraceId();
    return this.traceId;
  }

  getTraceId(): string {
    return this.traceId;
  }

  logEvent(event: string, data?: any): void {
    console.log(JSON.stringify({
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      event,
      data
    }));
  }
}

// Middleware for service tracing
export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tracer = Tracer.getInstance();
  const traceId = req.headers['x-trace-id'] as string || tracer.startTrace();
  
  req.headers['x-trace-id'] = traceId;
  res.setHeader('x-trace-id', traceId);
  
  tracer.logEvent('request_started', {
    method: req.method,
    url: req.url,
    service: process.env.SERVICE_NAME
  });
  
  next();
};
```

This inter-service communication design provides robust, fault-tolerant communication between microservices while maintaining traceability and observability.