# Hyred Platform - AI Agent Development Guide

## 🎯 Project Overview

Hyred is a comprehensive hiring platform that connects companies with virtual assistants. Built with modern web technologies, it features secure authentication, real-time messaging, integrated payment processing, and a sophisticated matching system. The platform is deployed at `blytz.work` with supporting services at `gateway.blytz.work` and `sudo.blytz.work`.

## 🏗️ Architecture Overview

### Technology Stack

**Frontend (Next.js)**
- Framework: Next.js 16.0.1 with TypeScript
- Styling: Tailwind CSS with Radix UI components
- Authentication: Firebase Auth (Google, Email providers)
- State Management: React Hook Form + TanStack Query
- Payments: Stripe.js integration
- Build: Webpack with standalone output

**Backend (Fastify)**
- Runtime: Node.js 20 with TypeScript
- Framework: Fastify 5.6.0 (high-performance HTTP framework)
- Database: PostgreSQL 15 with Prisma ORM
- Authentication: Firebase Admin SDK
- Validation: Zod schemas for input validation
- Security: JWT tokens, rate limiting, CORS protection

**Infrastructure**
- Containerization: Docker with multi-stage builds
- Reverse Proxy: Traefik with Let's Encrypt SSL
- Orchestration: Docker Compose with Dokploy
- Caching: Redis 7-alpine
- Deployment: VPS on Linux environment

## 📁 Project Structure

```
/home/sas/blytz.work/
├── backend/                    # Fastify API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── plugins/           # Fastify plugins (auth, etc.)
│   │   ├── utils/             # Utilities (prisma, validation)
│   │   └── server.ts          # Main server entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema definitions
│   └── dist/                  # Compiled TypeScript output
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts (Auth, etc.)
│   │   ├── lib/               # Utilities and API clients
│   │   └── styles/            # Global CSS styles
│   └── public/                # Static assets
├── nginx/                      # Reverse proxy configuration
├── docs/                       # Documentation
├── docker-compose.*.yml        # Modular Docker configurations
├── dokploy.yml                # Traefik routing configuration
└── deploy scripts             # Deployment automation
```

## 🚀 Build and Deployment Commands

### Local Development
```bash
# Install dependencies
npm install

# Start database services
docker-compose -f docker-compose.1-infrastructure.yml up -d
docker-compose -f docker-compose.2-database.yml up -d

# Run backend development server
cd backend && npm run dev

# Run frontend development server
cd frontend && npm run dev
```

### Production Deployment
```bash
# Full production deployment
./deploy.sh

# Test deployment with health checks
./test-platform.sh

# Test specific components
./test-week1-auth.sh      # Authentication tests
./test-week2-profiles.sh  # Profile functionality tests
./test-soc.sh             # Security tests
```

### Database Operations
```bash
# Generate Prisma client
cd backend && npx prisma generate

# Run database migrations
cd backend && npx prisma migrate deploy

# Reset database (development only)
cd backend && npx prisma migrate reset
```

## 🔐 Security Implementation

### Authentication Flow
1. Users authenticate via Firebase (Google OAuth or Email/Password)
2. Firebase returns JWT token to frontend
3. Frontend includes token in API requests
4. Backend validates token using Firebase Admin SDK
5. User session maintained with secure HTTP-only cookies

### Security Measures
- **HTTPS Enforcement**: Automatic SSL via Traefik + Let's Encrypt
- **Input Validation**: Zod schemas validate all API inputs
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS Protection**: Restricted to specific origins
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + Content Security Policy

### Payment Security
- **PCI Compliance**: Stripe handles all payment processing
- **Webhook Security**: Stripe webhook signatures verified
- **Platform Fees**: Automatically calculated and processed

## 🧪 Testing Strategy

### Backend Testing
```bash
# Run all backend tests
cd backend && npm test

# Run specific test suites
cd backend && npm test -- --testNamePattern="auth"
cd backend && npm test -- --testNamePattern="profiles"
```

### Integration Testing
```bash
# Platform-wide health checks
./test-platform.sh

# Authentication flow testing
./test-week1-auth.sh

# Profile functionality testing
./test-week2-profiles.sh

# Security vulnerability testing
./test-soc.sh
```

### Manual Testing Checklist
- [ ] User registration (Google + Email)
- [ ] Profile creation (VA + Company)
- [ ] Job posting and application
- [ ] Real-time messaging
- [ ] Payment processing
- [ ] Contract management
- [ ] Review and rating system

## 📊 Database Schema

### Core Entities
- **User**: Central authentication entity with role-based access
- **VAProfile**: Virtual Assistant detailed profiles with skills, experience
- **Company**: Company profiles with verification status
- **Job**: Job postings with requirements and compensation
- **Contract**: Employment agreements between companies and VAs
- **Payment**: Financial transactions with Stripe integration
- **Review**: Rating and feedback system
- **Message**: Real-time chat system

### Key Relationships
- Users can have one VAProfile OR one Company profile
- Companies can post multiple Jobs
- VAs can apply to multiple Jobs
- Contracts link Companies with VAs
- Payments are associated with Contracts
- Reviews can be given by Companies to VAs and vice versa

## 🔄 Development Workflow

### Code Style Guidelines
- **TypeScript**: Strict mode enabled, explicit return types
- **React**: Functional components with hooks, no class components
- **API Routes**: RESTful design with proper HTTP status codes
- **Error Handling**: Consistent error responses with proper status codes
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Grouped by external libraries, internal modules, relative imports

### Git Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run full test suite
4. Create pull request with description
5. Code review required before merge
6. Deploy to production via automated scripts

### Environment Variables
Key environment variables required (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key

## 🚨 Security Considerations

### Critical Security Fixes Applied
The project includes comprehensive security fixes documented in `SECURITY_FIXES_AND_GUIDE.md`:
- Authentication bypass vulnerabilities resolved
- Database credential hardcoding eliminated
- Input validation strengthened
- Rate limiting implemented
- CORS properly configured
- HTTPS enforcement added

### Ongoing Security Practices
- Regular dependency updates
- Security audit of npm packages
- Input validation on all endpoints
- Principle of least privilege for database access
- Secure secret management
- Regular security testing

## 📈 Monitoring and Logging

### Application Logging
- **Backend**: Pino logger with structured JSON output
- **Frontend**: Browser console with error boundaries
- **Database**: Prisma query logging (development only)

### Health Monitoring
- Service health checks via `/health` endpoints
- Database connectivity monitoring
- Payment system status monitoring
- Real-time error alerting

### Performance Metrics
- API response time tracking
- Database query performance
- Frontend bundle size monitoring
- User experience metrics

## 🆘 Common Issues and Solutions

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.2-database.yml ps

# Restart database services
docker-compose -f docker-compose.2-database.yml restart

# Check connection string
printenv DATABASE_URL
```

### Firebase Authentication Issues
- Verify Firebase project configuration
- Check service account credentials
- Ensure proper environment variables are set

### Stripe Payment Issues
- Verify webhook endpoint configuration
- Check Stripe API keys
- Review webhook signature validation

### Deployment Issues
- Check Docker container logs: `docker logs <container_name>`
- Verify Traefik routing configuration
- Ensure SSL certificates are properly configured

## 📚 Additional Resources

- **Documentation**: See `/docs` directory for detailed guides
- **API Reference**: Backend routes documented in code comments
- **Component Library**: Frontend components in `/frontend/src/components`
- **Database Schema**: Prisma schema in `/backend/prisma/schema.prisma`
- **Security Guide**: `SECURITY_FIXES_AND_GUIDE.md` for security implementation

---

*This guide is intended for AI coding agents working on the Hyred platform. For questions or clarifications, refer to the codebase comments and documentation before making assumptions about the project structure or implementation details.*