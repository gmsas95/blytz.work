# Service Discovery & Configuration Implementation

## Service Registration & Discovery

### 1. Docker Compose Service Discovery
```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # Consul for Service Discovery (Optional for Production)
  consul:
    image: consul:1.15
    command: agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
    ports:
      - "8500:8500"
    environment:
      - CONSUL_BIND_INTERFACE=eth0
    networks:
      - microservices-network

  # Redis for Events & Caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - microservices-network

  # API Gateway (Traefik)
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@blytz.work"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - microservices-network

  # User Service
  user-service:
    build: 
      context: ./services/user-service
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${USERS_DB_URL}
      - REDIS_URL=redis://redis:6379
      - CONSUL_HOST=consul:8500
      - SERVICE_NAME=user-service
      - SERVICE_PORT=3001
    depends_on:
      - redis
      - postgres-users
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.users.rule=Host(`api.blytz.work`) && PathPrefix(`/api/users`)"
      - "traefik.http.routers.users.middlewares=users-stripprefix"
      - "traefik.http.middlewares.users-stripprefix.stripprefix.prefixes=/api/users"
      - "traefik.http.services.users.loadbalancer.server.port=3001"
    networks:
      - microservices-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Marketplace Service
  marketplace-service:
    build: 
      context: ./services/marketplace-service
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3002
      - DATABASE_URL=${MARKETPLACE_DB_URL}
      - REDIS_URL=redis://redis:6379
      - USER_SERVICE_URL=http://user-service:3001
      - SERVICE_NAME=marketplace-service
      - SERVICE_PORT=3002
    depends_on:
      - redis
      - postgres-marketplace
      - user-service
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.marketplace.rule=Host(`api.blytz.work`) && PathPrefix(`/api/jobs`)"
      - "traefik.http.routers.marketplace.middlewares=marketplace-stripprefix"
      - "traefik.http.middlewares.marketplace-stripprefix.stripprefix.prefixes=/api/jobs"
      - "traefik.http.services.marketplace.loadbalancer.server.port=3002"
    networks:
      - microservices-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database Services
  postgres-users:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=users_db
      - POSTGRES_USER=users_service
      - POSTGRES_PASSWORD=${USERS_DB_PASSWORD}
    volumes:
      - postgres_users_data:/var/lib/postgresql/data
    networks:
      - microservices-network

  postgres-marketplace:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=marketplace_db
      - POSTGRES_USER=marketplace_service
      - POSTGRES_PASSWORD=${MARKETPLACE_DB_PASSWORD}
    volumes:
      - postgres_marketplace_data:/var/lib/postgresql/data
    networks:
      - microservices-network

networks:
  microservices-network:
    driver: bridge

volumes:
  postgres_users_data:
  postgres_marketplace_data:
```

### 2. Service Registry (Consul-based)
```typescript
// shared/discovery/ServiceRegistry.ts
import Consul from 'consul';

export interface ServiceInfo {
  id: string;
  name: string;
  address: string;
  port: number;
  tags: string[];
  health: 'healthy' | 'unhealthy';
  lastSeen: Date;
}

export class ServiceRegistry {
  private consul: Consul;
  private serviceName: string;
  private serviceId: string;
  private servicePort: number;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(options: {
    serviceName: string;
    servicePort: number;
    consulHost?: string;
    consulPort?: number;
  }) {
    this.serviceName = options.serviceName;
    this.servicePort = options.servicePort;
    this.serviceId = `${options.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.consul = new Consul({
      host: options.consulHost || 'localhost',
      port: options.consulPort || 8500
    });
  }

  async register(): Promise<void> {
    const serviceAddress = process.env.SERVICE_ADDRESS || this.getContainerIP();
    
    await this.consul.agent.service.register({
      id: this.serviceId,
      name: this.serviceName,
      address: serviceAddress,
      port: this.servicePort,
      tags: [process.env.NODE_ENV || 'development'],
      check: {
        http: `http://${serviceAddress}:${this.servicePort}/health`,
        interval: '30s',
        timeout: '10s'
      }
    });

    console.log(`Service ${this.serviceName} registered with ID: ${this.serviceId}`);

    // Start periodic health check updates
    this.startHealthCheckUpdates();
  }

  async deregister(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await this.consul.agent.service.deregister(this.serviceId);
    console.log(`Service ${this.serviceName} deregistered`);
  }

  async discover(serviceName: string): Promise<ServiceInfo[]> {
    try {
      const services = await this.consul.health.service({
        service: serviceName,
        passing: true
      });

      return services.map(service => ({
        id: service.Service.ID,
        name: service.Service.Service,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags || [],
        health: 'healthy',
        lastSeen: new Date()
      }));
    } catch (error) {
      console.error(`Failed to discover service ${serviceName}:`, error);
      return [];
    }
  }

  async getRandomInstance(serviceName: string): Promise<ServiceInfo | null> {
    const services = await this.discover(serviceName);
    if (services.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  }

  private getContainerIP(): string {
    // Try to get the container's IP address
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]!) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
    return 'localhost';
  }

  private startHealthCheckUpdates(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.consul.agent.check.pass({
          id: `service:${this.serviceId}`
        });
      } catch (error) {
        console.error('Failed to update health check:', error);
      }
    }, 10000); // Every 10 seconds
  }
}
```

### 3. Simple Service Discovery (Docker-based)
```typescript
// shared/discovery/DockerServiceDiscovery.ts
export class DockerServiceDiscovery {
  private static instance: DockerServiceDiscovery;
  private serviceCache: Map<string, ServiceInfo[]> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  static getInstance(): DockerServiceDiscovery {
    if (!DockerServiceDiscovery.instance) {
      DockerServiceDiscovery.instance = new DockerServiceDiscovery();
    }
    return DockerServiceDiscovery.instance;
  }

  async discover(serviceName: string): Promise<ServiceInfo[]> {
    const cached = this.serviceCache.get(serviceName);
    if (cached && Date.now() - cached[0].lastSeen.getTime() < this.cacheTimeout) {
      return cached;
    }

    try {
      // For Docker Compose, use service names directly
      const serviceUrls = this.getDockerServiceUrls(serviceName);
      const services: ServiceInfo[] = serviceUrls.map((url, index) => {
        const [address, port] = url.split(':');
        return {
          id: `${serviceName}-${index}`,
          name: serviceName,
          address,
          port: parseInt(port),
          tags: ['docker-compose'],
          health: 'healthy',
          lastSeen: new Date()
        };
      });

      this.serviceCache.set(serviceName, services);
      return services;
    } catch (error) {
      console.error(`Failed to discover Docker service ${serviceName}:`, error);
      return [];
    }
  }

  async getHealthyInstance(serviceName: string): Promise<ServiceInfo | null> {
    const services = await this.discover(serviceName);
    if (services.length === 0) return null;

    // Try each service until finding a healthy one
    for (const service of services) {
      if (await this.isServiceHealthy(service)) {
        return service;
      }
    }

    return null;
  }

  private getDockerServiceUrls(serviceName: string): string[] {
    // Map service names to their Docker Compose URLs
    const serviceMappings: Record<string, string[]> = {
      'user-service': ['user-service:3001'],
      'marketplace-service': ['marketplace-service:3002'],
      'contracts-service': ['contracts-service:3003'],
      'payments-service': ['payments-service:3004'],
      'communication-service': ['communication-service:3005'],
      'file-service': ['file-service:3006']
    };

    return serviceMappings[serviceName] || [];
  }

  private async isServiceHealthy(service: ServiceInfo): Promise<boolean> {
    try {
      const response = await fetch(`http://${service.address}:${service.port}/health`, {
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## Configuration Management

### 1. Centralized Configuration Service
```typescript
// shared/config/ConfigurationService.ts
export interface ServiceConfig {
  database: {
    url: string;
    poolSize: number;
    timeout: number;
  };
  redis: {
    url: string;
    keyPrefix: string;
  };
  services: Record<string, string>;
  features: Record<string, boolean>;
  monitoring: {
    metrics: boolean;
    tracing: boolean;
    loggingLevel: string;
  };
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: ServiceConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || process.env.CONFIG_PATH || './config/service.json';
    this.config = this.loadConfiguration();
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private loadConfiguration(): ServiceConfig {
    try {
      // Load from environment variables first
      const envConfig = this.loadFromEnvironment();
      
      // Override with file configuration if exists
      const fileConfig = this.loadFromFile();
      
      // Apply service-specific configuration
      const serviceConfig = this.getServiceSpecificConfig();

      return { ...envConfig, ...fileConfig, ...serviceConfig };
    } catch (error) {
      console.error('Failed to load configuration, using defaults:', error);
      return this.getDefaultConfig();
    }
  }

  private loadFromEnvironment(): Partial<ServiceConfig> {
    return {
      database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/default',
        poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        timeout: parseInt(process.env.DB_TIMEOUT || '30000')
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'blytz:'
      },
      services: {
        userService: process.env.USER_SERVICE_URL || 'http://user-service:3001',
        marketplaceService: process.env.MARKETPLACE_SERVICE_URL || 'http://marketplace-service:3002',
        contractsService: process.env.CONTRACTS_SERVICE_URL || 'http://contracts-service:3003',
        paymentsService: process.env.PAYMENTS_SERVICE_URL || 'http://payments-service:3004',
        communicationService: process.env.COMMUNICATION_SERVICE_URL || 'http://communication-service:3005',
        fileService: process.env.FILE_SERVICE_URL || 'http://file-service:3006'
      },
      features: {
        enableCaching: process.env.ENABLE_CACHING === 'true',
        enableTracing: process.env.ENABLE_TRACING === 'true',
        enableMetrics: process.env.ENABLE_METRICS === 'true'
      },
      monitoring: {
        metrics: process.env.ENABLE_METRICS === 'true',
        tracing: process.env.ENABLE_TRACING === 'true',
        loggingLevel: process.env.LOG_LEVEL || 'info'
      }
    };
  }

  private loadFromFile(): Partial<ServiceConfig> {
    try {
      if (require('fs').existsSync(this.configPath)) {
        const configData = require('fs').readFileSync(this.configPath, 'utf8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.warn(`Failed to load config from file ${this.configPath}:`, error);
    }
    return {};
  }

  private getServiceSpecificConfig(): Partial<ServiceConfig> {
    const serviceName = process.env.SERVICE_NAME;
    
    // Service-specific configurations
    const serviceConfigs: Record<string, Partial<ServiceConfig>> = {
      'user-service': {
        database: {
          poolSize: 20, // User service needs more connections
          timeout: 10000
        }
      },
      'payments-service': {
        features: {
          enableCaching: false, // Payment service needs real-time data
        },
        monitoring: {
          loggingLevel: 'warn' // Higher security for logs
        }
      },
      'marketplace-service': {
        database: {
          poolSize: 15
        },
        features: {
          enableCaching: true // Cache job listings
        }
      }
    };

    return serviceConfigs[serviceName!] || {};
  }

  private getDefaultConfig(): ServiceConfig {
    return {
      database: {
        url: 'postgresql://localhost:5432/default',
        poolSize: 10,
        timeout: 30000
      },
      redis: {
        url: 'redis://localhost:6379',
        keyPrefix: 'blytz:'
      },
      services: {},
      features: {},
      monitoring: {
        metrics: false,
        tracing: false,
        loggingLevel: 'info'
      }
    };
  }

  get<T>(path: string): T {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        throw new Error(`Configuration path '${path}' not found`);
      }
    }
    
    return value as T;
  }

  set(path: string, value: any): void {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  watch(path: string, callback: (newValue: any) => void): () => void {
    // Simple file watcher for configuration changes
    let currentValue = this.get(path);
    
    const interval = setInterval(() => {
      const newValue = this.get(path);
      if (newValue !== currentValue) {
        currentValue = newValue;
        callback(newValue);
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}
```

### 2. Service Bootstrap
```typescript
// shared/bootstrap/ServiceBootstrap.ts
import { ServiceRegistry } from '../discovery/ServiceRegistry.js';
import { ConfigurationService } from '../config/ConfigurationService.js';
import { DockerServiceDiscovery } from '../discovery/DockerServiceDiscovery.js';

export class ServiceBootstrap {
  private registry: ServiceRegistry | null = null;
  private config: ConfigurationService;
  private serviceName: string;
  private servicePort: number;

  constructor(serviceName: string, servicePort: number) {
    this.serviceName = serviceName;
    this.servicePort = servicePort;
    this.config = ConfigurationService.getInstance();
  }

  async initialize(): Promise<void> {
    console.log(`Initializing ${this.serviceName}...`);

    // Load configuration
    await this.validateConfiguration();

    // Setup service discovery
    await this.setupServiceDiscovery();

    // Setup graceful shutdown
    this.setupGracefulShutdown();

    console.log(`${this.serviceName} initialized successfully`);
  }

  private async validateConfiguration(): Promise<void> {
    try {
      // Validate database connection
      const dbUrl = this.config.get<string>('database.url');
      if (!dbUrl) {
        throw new Error('Database URL is required');
      }

      // Validate Redis connection
      const redisUrl = this.config.get<string>('redis.url');
      if (!redisUrl) {
        throw new Error('Redis URL is required');
      }

      console.log('✅ Configuration validation passed');
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      process.exit(1);
    }
  }

  private async setupServiceDiscovery(): Promise<void> {
    try {
      // Use Docker-based discovery for simplicity
      const discovery = DockerServiceDiscovery.getInstance();
      
      // Try to discover dependent services
      const requiredServices = this.getRequiredServices();
      
      for (const serviceName of requiredServices) {
        const instance = await discovery.getHealthyInstance(serviceName);
        if (!instance) {
          console.warn(`⚠️  Service ${serviceName} not available at startup`);
        } else {
          console.log(`✅ Service ${serviceName} found at ${instance.address}:${instance.port}`);
        }
      }

      console.log('✅ Service discovery setup completed');
    } catch (error) {
      console.error('❌ Service discovery setup failed:', error);
    }
  }

  private getRequiredServices(): string[] {
    const serviceDependencies: Record<string, string[]> = {
      'marketplace-service': ['user-service'],
      'contracts-service': ['user-service', 'marketplace-service'],
      'payments-service': ['user-service', 'contracts-service'],
      'communication-service': ['user-service'],
      'file-service': ['user-service']
    };

    return serviceDependencies[this.serviceName] || [];
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      if (this.registry) {
        await this.registry.deregister();
      }
      
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  getConfig(): ConfigurationService {
    return this.config;
  }

  getServiceName(): string {
    return this.serviceName;
  }
}
```

### 3. Usage Example in Service
```typescript
// services/user-service/src/server.ts
import { ServiceBootstrap } from '@shared/bootstrap/ServiceBootstrap.js';
import { ConfigurationService } from '@shared/config/ConfigurationService.js';

async function startUserServer() {
  // Bootstrap the service
  const bootstrap = new ServiceBootstrap('user-service', 3001);
  await bootstrap.initialize();

  const config = bootstrap.getConfig();
  
  // Create Fastify instance with configuration
  const app = Fastify({
    logger: {
      level: config.get('monitoring.loggingLevel')
    }
  });

  // Register plugins and routes
  await app.register(cors, {
    origin: config.get('cors.allowedOrigins')
  });

  // Setup health endpoint
  app.get('/health', async () => ({
    status: 'healthy',
    service: bootstrap.getServiceName(),
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || '1.0.0'
  }));

  // Start server
  try {
    await app.listen({ 
      port: bootstrap.servicePort,
      host: '0.0.0.0'
    });
    console.log(`🚀 User service listening on port ${bootstrap.servicePort}`);
  } catch (err) {
    console.error('❌ Failed to start user service:', err);
    process.exit(1);
  }
}

startUserServer();
```

This service discovery and configuration implementation provides a robust foundation for your microservice architecture with proper service registration, configuration management, and graceful handling of service dependencies.