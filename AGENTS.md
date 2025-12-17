# Hyred Platform - AI Agent Development Guide

## 🎯 Project Overview

BlytzWork is a comprehensive hiring platform that connects companies with virtual assistants. Built with modern web technologies, it features secure authentication, real-time messaging, integrated payment processing, and a sophisticated matching system. The platform is deployed at `blytz.work` with supporting services at `gateway.blytz.work` and `sudo.blytz.work`.

**Current Status**: ✅ Production-ready with enhanced security fixes, comprehensive VA profiles, and real-time chat system

## 🏗️ Architecture Overview

### Technology Stack

**Frontend (Next.js)**
- Framework: Next.js 16.0.7 with React 19.2.0 (latest versions)
- Styling: Tailwind CSS with comprehensive Radix UI component library
- Authentication: Firebase Auth with enhanced runtime configuration handling
- State Management: React Hook Form + TanStack Query + Context API
- Payments: Stripe.js integration with secure token handling
- Build: Webpack with standalone output and optimized Docker builds
- Status: ✅ Production-ready with robust Firebase authentication and error handling

**Backend (Fastify)**
- Runtime: Node.js 20 with TypeScript 5.9.3
- Framework: Fastify 5.6.0 (high-performance HTTP framework)
- Database: PostgreSQL 15 with comprehensive Prisma ORM schema
- Authentication: Firebase Admin SDK with production-ready verification
- Validation: Comprehensive Zod schemas for all API inputs
- Security: JWT tokens, rate limiting (100 req/15min), CORS protection
- Real-time: Socket.IO WebSocket server for chat functionality
- Status: ✅ Production-ready with enhanced security fixes and TypeScript compilation resolved

**Infrastructure**
- Containerization: Multi-stage Docker builds with health checks
- Reverse Proxy: Traefik 2.x with automatic Let's Encrypt SSL
- Orchestration: Modular Docker Compose with Dokploy deployment
- Caching: Redis 7-alpine for session management
- Database: PostgreSQL 15 with comprehensive schema (17 models)
- Deployment: VPS on Linux with automated deployment scripts
- Status: ✅ Full production deployment with monitoring and health checks

## 📁 Project Structure

```
/home/sas/blytz.work/
├── backend/                    # Fastify API server
│   ├── src/
│   │   ├── routes/            # API route handlers (9 modules)
│   │   │   ├── chat-final-fix.ts    # Production-ready chat system with Socket.IO
│   │   │   ├── auth.ts        # Authentication endpoints with Firebase sync
│   │   │   ├── payments.ts    # Comprehensive Stripe payment processing
│   │   │   ├── va.ts          # VA profile management (34+ fields)
│   │   │   ├── company.ts     # Company profile management
│   │   │   ├── contracts.ts   # Contract management with milestones
│   │   │   ├── jobMarketplace.ts # Job posting and applications
│   │   │   ├── upload.ts      # File upload handling
│   │   │   └── health.ts      # Health check endpoints
│   │   ├── plugins/           # Fastify plugins (auth, etc.)
│   │   │   ├── firebaseAuthDebug.ts    # Enhanced Firebase auth with logging
│   │   │   └── firebaseAuth.ts         # Production-ready Firebase auth
│   │   ├── utils/             # Utilities (prisma, validation, errors)
│   │   │   ├── prisma.ts      # Database connection with security fixes
│   │   │   ├── validation.ts  # Zod schema validation
│   │   │   ├── errors.ts      # Error handling utilities
│   │   │   ├── response.ts    # Standardized API responses
│   │   │   ├── stripe.ts      # Stripe integration utilities
│   │   │   └── envValidator.ts # Environment variable validation
│   │   ├── services/          # Business logic services
│   │   │   └── websocketServer.ts      # Real-time chat with Socket.IO
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── fastify.d.ts   # Fastify request type extensions
│   │   ├── config/            # Configuration files
│   │   │   └── firebaseConfig.ts # Firebase configuration
│   │   ├── server.ts          # Main server entry point with all routes
│   │   └── server-enhanced.ts # Enhanced server with WebSocket support
│   ├── prisma/
│   │   ├── schema.prisma      # Comprehensive database schema (17 models)
│   │   ├── chat-models-addition.prisma # Chat schema extensions
│   │   └── chat-schema-addition.sql # Chat SQL migrations
│   ├── tests/                 # Test suite with Jest
│   │   ├── api.test.ts        # API endpoint tests
│   │   ├── payments.test.ts    # Payment processing tests
│   │   ├── stripe.test.ts     # Stripe integration tests
│   │   └── setup.ts           # Test configuration
│   └── dist/                  # Compiled TypeScript output
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages (15+ routes)
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── employer/      # Company dashboard and onboarding
│   │   │   ├── va/            # VA dashboard and profile management
│   │   │   ├── chat/          # Real-time chat interface
│   │   │   ├── contract/      # Contract management pages
│   │   │   ├── api/           # API routes for frontend
│   │   │   └── [..other pages] # FAQ, pricing, terms, etc.
│   │   ├── components/        # React components (30+ components)
│   │   │   ├── auth/          # Authentication components
│   │   │   │   ├── EnhancedAuthForm.tsx  # Production-ready auth with debug
│   │   │   │   └── SimpleAuthForm.tsx    # Basic auth form
│   │   │   └── ui/            # Comprehensive Radix UI components (40+)
│   │   ├── contexts/          # React contexts for state management
│   │   │   └── AuthContext.tsx           # Firebase auth context
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useAuth.ts     # Authentication hook
│   │   ├── lib/               # Utilities and API clients (10+ files)
│   │   │   ├── firebase-runtime-final.ts # Production Firebase config
│   │   │   ├── firebase-safe.ts        # Safe Firebase initialization
│   │   │   ├── auth.ts                 # Authentication utilities
│   │   │   ├── auth-utils.ts           # Token management
│   │   │   ├── api.ts                  # API client utilities
│   │   │   └── [..other utilities]     # Various utility functions
│   │   ├── styles/            # Global CSS styles and Tailwind
│   │   └── middleware.ts      # Next.js middleware for auth
│   └── public/                # Static assets
├── nginx/                      # Nginx reverse proxy configuration
├── docs/                       # Comprehensive documentation (15+ files)
├── docker-compose.*.yml        # Modular Docker configurations (6 files)
├── dokploy.yml                # Traefik routing configuration
├── scripts/                   # Utility scripts
│   └── debug-auth.sh          # Authentication debugging tool
├── SECURITY_FIXES_AND_GUIDE.md # Security implementation guide
├── CLEANUP_SUMMARY.md         # Code cleanup documentation
├── .env.example               # Environment variable template
└── deploy scripts             # Automated deployment scripts
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

# Database schema updates
cd backend && npx prisma migrate dev
```

## 🔐 Security Implementation

### Authentication Flow
1. Users authenticate via Firebase (Google OAuth or Email/Password)
2. Firebase returns JWT token to frontend with runtime configuration validation
3. Frontend includes token in API requests via `Authorization: Bearer` header
4. Backend validates token using Firebase Admin SDK with production-ready verification
5. User session maintained with secure token refresh and database synchronization

### Security Measures (Enhanced)
- **Authentication Bypass Fixed**: Removed mock development authentication
- **Database Security**: Eliminated hardcoded credentials, enforced environment variables
- **HTTPS Enforcement**: Automatic SSL via Traefik + Let's Encrypt
- **Input Validation**: Comprehensive Zod schemas validate all API inputs
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS Protection**: Restricted to specific origins with proper headers
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + Content Security Policy
- **Environment Security**: Secure handling of Dokploy template syntax
- **TypeScript Compilation**: Fixed all TS2339, TS2322, TS2307 errors

### Payment Security
- **PCI Compliance**: Stripe handles all payment processing with proper error handling
- **Webhook Security**: Stripe webhook signatures verified
- **Platform Fees**: Automatically calculated and processed (10% default)
- **Refund System**: Complete refund and dispute resolution workflow

## 💬 Real-Time Chat System

### Chat Implementation (Enhanced)
- **Technology**: Socket.IO WebSocket server with Firebase authentication
- **Storage**: Uses existing Notification model with message-specific data structure
- **Features**: Real-time messaging, message status, unread counts, online presence
- **Security**: Firebase authentication required for all chat operations
- **Routes**: `/api/chat/*` endpoints with comprehensive auth guards
- **WebSocket Events**: join-chat, send-message, mark-as-read, get-unread-count

### Chat Features
- Send/receive messages in real-time with Socket.IO
- Message status tracking (sent/delivered/read)
- Unread message counts with real-time updates
- Chat history with pagination and filtering
- Role-based access (VA ↔ Company communication)
- Online user presence tracking
- Message persistence in database
- Authentication middleware for all socket connections

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

## 📊 Database Schema (Comprehensive)

### Core Entities (17 Models)
- **User**: Central authentication entity with role-based access
- **VAProfile**: Comprehensive VA profiles (34+ fields) with skills, experience, analytics
- **Company**: Company profiles with verification status and spending tracking
- **JobPosting**: Detailed job postings with requirements, benefits, and application tracking
- **Job**: Active job instances linking companies with VAs
- **Proposal**: VA proposals for job applications with bid details
- **Contract**: Employment agreements with milestones, terms, and payment schedules
- **Payment**: Financial transactions with Stripe integration and fee tracking
- **Milestone**: Contract milestones with approval workflows
- **Timesheet**: Time tracking for hourly contracts
- **Invoice**: Billing system with tax calculations
- **Review**: Comprehensive rating and feedback system
- **Notification**: Multi-purpose notification system (including chat messages)
- **PortfolioItem**: VA work samples and project showcases
- **SkillsAssessment**: Technical skill validation and scoring
- **Badge**: Achievement and recognition system
- **Match**: Matching system (currently disabled for professional approach)

### Key Relationships
- Users can have one VAProfile OR one Company profile (exclusive)
- Companies can post multiple JobPostings and create multiple Jobs
- VAs can create multiple Proposals and work on multiple Contracts
- Contracts contain multiple Milestones and associated Payments
- Payments can be linked to Jobs, Contracts, or Milestones
- Reviews can be given by Companies to VAs and vice versa
- Notifications serve both system alerts and chat messages
- PortfolioItems and SkillsAssessments belong to VAProfiles

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
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key for frontend
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID

## 🚨 Security Considerations

### Critical Security Fixes Applied
The project includes comprehensive security fixes documented in `SECURITY_FIXES_AND_GUIDE.md`:
- ✅ **Authentication Bypass Fixed**: Removed mock development authentication
- ✅ **Database Credentials Secured**: Eliminated hardcoded credentials
- ✅ **Input Validation Strengthened**: Comprehensive Zod schema validation
- ✅ **Rate Limiting Implemented**: 100 requests per 15-minute window
- ✅ **CORS Properly Configured**: Restricted origins with proper headers
- ✅ **HTTPS Enforcement Added**: Automatic SSL via Traefik
- ✅ **TypeScript Compilation Fixed**: Resolved all TS errors
- ✅ **Firebase Integration Enhanced**: Production-ready configuration handling

### Recent Security Improvements
- **Authentication**: Production Firebase Admin SDK with proper token verification
- **Environment Security**: Secure handling of Dokploy template syntax
- **Error Handling**: Consistent error responses without data exposure
- **Database Security**: Environment variable enforcement for connection strings
- **Chat System**: Consolidated to single secure implementation with Socket.IO
- **WebSocket Server**: Authentication middleware for all socket connections
- **Payment Security**: Enhanced Stripe integration with proper validation

### Ongoing Security Practices
- Regular dependency updates and vulnerability scanning
- Security audit of npm packages with automated alerts
- Input validation on all API endpoints with Zod schemas
- Principle of least privilege for database access
- Secure secret management with environment variables
- Regular security testing and penetration testing
- SSL certificate monitoring and automatic renewal

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

# Check connection string (must be set via environment)
printenv DATABASE_URL

# Generate Prisma client if needed
cd backend && npx prisma generate

# Run database migrations
cd backend && npx prisma migrate deploy
```

### Firebase Authentication Issues
- Verify Firebase project configuration in console
- Check service account credentials and permissions
- Ensure proper environment variables are set (no template syntax)
- Use debug script: `./scripts/debug-auth.sh`
- Check frontend Firebase runtime configuration in `firebase-runtime-final.ts`

### TypeScript Compilation Errors
- All TS2339, TS2322, TS2307 errors have been resolved
- Verify all imports use correct file extensions (.js for compiled files)
- Ensure Firebase types are properly installed
- Check for duplicate route files or conflicting definitions

### Build Process Issues
- Frontend: Ensure `NEXT_PUBLIC_FIREBASE_*` variables are properly set
- Backend: Verify all Firebase credentials are configured in production
- Check for conflicting TypeScript definitions
- Use proper error handling for unknown error types
- Ensure Docker builds complete successfully with health checks

### Deployment Issues
- Check Docker container logs: `docker logs <container_name>`
- Verify Traefik routing configuration in `dokploy.yml`
- Ensure SSL certificates are properly configured via Let's Encrypt
- Check for build cache issues: `docker system prune`
- Verify environment variables are properly injected by Dokploy
- Check health check endpoints: `/health` on backend, `/` on frontend

## 🗑️ Codebase Cleanup Notes

### Recent Cleanup Actions
- ✅ Removed temporary debug files and backup files
- ✅ Cleaned up console.log statements in production code
- ✅ Consolidated duplicate chat route implementations to `chat-final-fix.ts`
- ✅ Updated Firebase initialization for production readiness with `firebase-runtime-final.ts`
- ✅ Fixed all TypeScript compilation errors (TS2339, TS2322, TS2307)
- ✅ Enhanced security by removing authentication bypass vulnerabilities
- ✅ Eliminated hardcoded database credentials
- ✅ Standardized error handling across all API endpoints
- ✅ Implemented comprehensive input validation with Zod schemas

### Files to Keep for Reference
- `docker-compose.env-fix.yml` - Alternative environment configuration
- `nginx/nginx.conf.fixed` - Alternative nginx configuration
- `scripts/debug-auth.sh` - Authentication debugging tool
- `SECURITY_FIXES_AND_GUIDE.md` - Comprehensive security implementation guide
- `CLEANUP_SUMMARY.md` - Detailed cleanup documentation

## 📚 Additional Resources

- **Documentation**: See `/docs` directory for detailed guides
- **API Reference**: Backend routes documented in code comments
- **Component Library**: Frontend components in `/frontend/src/components`
- **Database Schema**: Prisma schema in `/backend/prisma/schema.prisma`
- **Security Guide**: `SECURITY_FIXES_AND_GUIDE.md` for security implementation

---

*This guide is intended for AI coding agents working on the Hyred platform. For questions or clarifications, refer to the codebase comments and documentation before making assumptions about the project structure or implementation details.*

**Last Updated**: December 2024 - Production deployment successful with enhanced security fixes, comprehensive VA profiles (34+ fields), real-time chat system, and complete TypeScript compilation resolution.

## 🎯 Current Production Status

### ✅ Fully Operational
- **Authentication**: Production Firebase with secure token verification
- **Database**: PostgreSQL 15 with comprehensive schema (17 models)
- **API**: Fastify backend with 9 route modules and full validation
- **Frontend**: Next.js 16.0.7 with React 19.2.0 and Radix UI
- **Chat**: Real-time messaging with Socket.IO and WebSocket support
- **Payments**: Stripe integration with refunds and dispute resolution
- **Security**: All critical vulnerabilities fixed and monitored
- **Deployment**: Automated Docker deployment with health checks

### 🚀 Key Features Available
- VA profile management with 34+ fields including skills, portfolio, analytics
- Company profiles with verification and spending tracking
- Job posting and application system with detailed requirements
- Contract management with milestones and payment schedules
- Real-time chat with message status and unread counts
- Comprehensive payment processing with platform fees
- File upload system with validation and security
- Advanced search and filtering capabilities
- Rating and review system
- Notification system for all platform events

### 📊 Business Ready
- Platform fee system (10% default, configurable)
- Multiple revenue streams (job postings, premium profiles, transaction fees)
- User analytics and financial tracking
- Professional marketplace experience
- Mobile-responsive design
- SEO-optimized structure