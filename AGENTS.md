# BlytzWork Platform - AI Agent Development Guide

## 🎯 Project Overview

BlytzWork is a comprehensive hiring platform connecting overwhelmed professionals with qualified virtual assistants. Built with modern web technologies, it features secure authentication, real-time messaging, integrated payment processing, and a sophisticated matching system.

**Platform URL**: [blytz.work](https://blytz.work)  
**API URL**: [api.blytz.work](https://api.blytz.work)  
**Status**: ✅ **Production-Ready (88% Complete)**

**Mission**: "Help overwhelmed professionals hire qualified virtual assistants in 7 days or less, with guaranteed quality and transparent pricing. We give people permission to not be superhuman."

---

## 📊 Current Production Status

### Running Services
| Component | Status | Container | Health |
|-----------|--------|-----------|--------|
| Backend API | ✅ Running | blytzwork-backend | Healthy |
| Frontend | 🟡 Unhealthy | blytz-frontend | Needs Fix |
| Production Backend | ✅ Running | blytzwork-production-backend | Healthy |
| Database | ✅ Healthy | blytz-postgres | Healthy |
| Redis | ✅ Healthy | blytz-redis | Healthy |

### Active Endpoints
| Endpoint | Status | Description |
|-----------|---------|-------------|
| `/api/auth` | ✅ LIVE | Complete authentication |
| `/api/company-profiles` | ✅ LIVE | Company management |
| `/api/va` | ✅ LIVE | VA operations |
| `/api/contracts` | ✅ LIVE | Contract management |
| `/api/upload` | ✅ LIVE | File uploads |
| `/api/chat/*` | ✅ LIVE | Real-time chat (Socket.IO) |
| `/api/health` | ✅ LIVE | Health monitoring |
| `/api/job-marketplace` | 🔄 READY | 95% complete |
| `/api/matching` | 🔄 READY | 95% complete |
| `/api/payments` | 🔄 READY | 95% complete |

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend (Next.js)**
- Framework: Next.js 16.0.7 with React 19.2.0
- Styling: Tailwind CSS 3.4.0 with Radix UI component library
- Authentication: Firebase Auth 10.13.1 with runtime configuration
- State Management: React Hook Form 7.53.0 + TanStack Query 5.56.2
- Real-time: Socket.IO Client 4.8.1 for WebSocket messaging
- Payments: Stripe.js 4.1.0 with secure token handling
- TypeScript: 5.9.3 in strict mode

**Backend (Fastify)**
- Runtime: Node.js 20.x
- Framework: Fastify 5.6.0 (high-performance HTTP framework)
- Database: PostgreSQL 15 with Prisma 6.19.0 ORM
- Authentication: Firebase Admin SDK 12.5.0 with production verification
- Validation: Zod 3.23.8 schemas for all API inputs
- Security: JWT tokens, rate limiting (100 req/15min), CORS protection
- Real-time: Socket.IO 4.8.1 WebSocket server
- Payments: Stripe 17.3.0 with webhooks and dispute resolution
- Testing: Jest 29.7.0 + Supertest

**Infrastructure**
- Containerization: Docker with multi-stage builds and health checks
- Reverse Proxy: Traefik 2.x with automatic Let's Encrypt SSL
- Orchestration: Modular Docker Compose with Dokploy deployment
- Caching: Redis 7-alpine for session management
- Database: PostgreSQL 15 with 17 comprehensive models
- Deployment: VPS on Linux with automated deployment scripts

### 3-Layer Separation of Concerns Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              HTTP Request                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         Routes Layer (HTTP)                             │
│  • Parse request body/params/query                     │
│  • Validate input (Zod schemas)                        │
│  • Check auth/authorization                            │
│  • Call service methods                                 │
│  • Format response                                     │
│  • Handle errors                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│       Services Layer (Business Logic)                     │
│  • Validate business rules                               │
│  • Enforce constraints                                  │
│  • Call repositories                                   │
│  • Call external services (Stripe, Email, Firebase)      │
│  • Transform data                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│      Repositories Layer (Data Access)                     │
│  • Execute Prisma queries                               │
│  • Return raw data                                      │
│  • No business logic                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database (17 Models)                     │
└─────────────────────────────────────────────────────────────┘
```

### Refactoring Results
- **52% code reduction** in route files (~4,352 → ~2,070 lines)
- **100% elimination** of direct Prisma calls in routes
- **9 repositories** created for data access abstraction
- **9 services** created for business logic encapsulation
- **7 routes** refactored as examples
- **Zero TypeScript errors** across entire codebase

---

## 📁 Project Structure

```
/home/sas/blytz.work/
├── backend/                    # Fastify API server
│   ├── src/
│   │   ├── routes/            # API endpoint handlers
│   │   │   ├── chat-final-fix.ts    # Production-ready chat
│   │   │   ├── auth.ts              # Firebase authentication
│   │   │   ├── company.ts           # Company operations
│   │   │   ├── contracts.ts         # Contract management
│   │   │   ├── va.ts                # VA profiles
│   │   │   ├── upload.ts            # File uploads
│   │   │   └── health.ts            # Health checks
│   │   ├── repositories/       # Data access layer (9 files)
│   │   │   ├── userRepository.ts
│   │   │   ├── companyRepository.ts
│   │   │   ├── vaProfileRepository.ts
│   │   │   ├── contractRepository.ts
│   │   │   ├── paymentRepository.ts
│   │   │   └── [..other repos]
│   │   ├── services/          # Business logic (9 services)
│   │   │   ├── authService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── contractService.ts
│   │   │   ├── profileService.ts
│   │   │   └── [..other services]
│   │   ├── plugins/           # Fastify plugins
│   │   │   ├── firebaseAuth.ts         # Production auth
│   │   │   └── firebaseAuthDebug.ts    # Debug auth
│   │   ├── utils/             # Utilities
│   │   │   ├── prisma.ts              # DB connection
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   ├── errors.ts             # Error handling
│   │   │   ├── response.ts           # API responses
│   │   │   ├── stripe.ts             # Stripe utils
│   │   │   └── envValidator.ts       # Env validation
│   │   ├── config/            # Configuration
│   │   │   └── firebaseConfig.ts     # Firebase config
│   │   └── server.ts          # Main entry point
│   ├── prisma/
│   │   └── schema.prisma      # 17 model database schema
│   ├── tests/                 # Jest test suite
│   └── package.json
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── app/               # App Router pages (15+ routes)
│   │   │   ├── auth/          # Authentication
│   │   │   ├── employer/      # Company dashboard
│   │   │   ├── va/            # VA dashboard
│   │   │   ├── chat/          # Real-time chat
│   │   │   ├── contract/      # Contract management
│   │   │   └── [..other pages]
│   │   ├── components/        # React components (40+ UI)
│   │   │   ├── auth/          # Auth forms
│   │   │   └── ui/            # Radix UI components
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/            # Custom hooks
│   │   │   └── useAuth.ts
│   │   ├── lib/              # Utilities and API clients
│   │   │   ├── firebase-runtime-final.ts
│   │   │   ├── api.ts
│   │   │   └── [..other utilities]
│   │   ├── middleware.ts      # Next.js middleware
│   │   └── globals.css        # Tailwind styles
│   └── package.json
├── docs/                       # Comprehensive documentation
├── docker-compose.*.yml        # Modular Docker configurations
├── dokploy.yml                # Traefik routing
└── scripts/                   # Utility scripts
```

---

## 🚀 Build and Deployment Commands

### Local Development
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Start infrastructure
docker-compose -f docker-compose.1-infrastructure.yml up -d
docker-compose -f docker-compose.2-database.yml up -d

# Run backend dev server
cd backend && npm run dev

# Run frontend dev server
cd frontend && npm run dev
```

### Production Deployment
```bash
# Full production deployment
./deploy.sh

# Test deployment with health checks
./test-platform.sh
```

### Database Operations
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

---

## 🔐 Security Implementation

### Authentication Flow
1. Users authenticate via Firebase (Google OAuth or Email/Password)
2. Firebase returns JWT token to frontend
3. Frontend includes token in API requests via `Authorization: Bearer` header
4. Backend validates token using Firebase Admin SDK
5. User session maintained with secure token refresh and database synchronization

### Security Measures Applied
- **Authentication Bypass Fixed**: Removed mock development authentication
- **Database Security**: Environment variables only, no hardcoded credentials
- **HTTPS Enforcement**: Automatic SSL via Traefik + Let's Encrypt
- **Input Validation**: Comprehensive Zod schemas on all endpoints
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS Protection**: Restricted origins with proper headers
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React escaping + Content Security Policy
- **Container Security**: No-new-privileges, resource limits
- **Redis Security**: Password protected, dangerous commands disabled

### Security Status
| Vulnerability | Status | Fix |
|---------------|---------|------|
| Authentication bypass | ✅ FIXED | Removed mock auth |
| Database exposure | ✅ FIXED | Ports closed, internal only |
| Weak auth | ✅ FIXED | SCRAM-SHA-256, strong passwords |
| TypeScript errors | ✅ FIXED | Zero compilation errors |

---

## 💬 Real-Time Chat System

### Implementation
- **Technology**: Socket.IO WebSocket server with Firebase authentication
- **Storage**: Uses existing Notification model with message-specific structure
- **Features**: Real-time messaging, message status, unread counts, online presence
- **Security**: Firebase authentication required for all chat operations

### Chat Features
- Send/receive messages in real-time
- Message status tracking (sent/delivered/read)
- Unread message counts with real-time updates
- Chat history with pagination and filtering
- Role-based access (VA ↔ Company communication)
- Online user presence tracking
- Message persistence in database

---

## 📊 Database Schema (17 Models)

### Core Models
- **User** - Authentication and profile linkage
- **VAProfile** - 34+ fields (skills, portfolio, analytics)
- **Company** - Business profiles with verification
- **JobPosting** - Detailed job listings
- **Job** - Active job instances
- **Proposal** - VA proposals with bids
- **Contract** - Employment agreements
- **Payment** - Financial transactions with Stripe
- **Milestone** - Contract phases
- **Timesheet** - Time tracking
- **Invoice** - Billing system
- **Review** - Rating and feedback
- **Notification** - System alerts and chat messages
- **PortfolioItem** - VA work samples
- **SkillsAssessment** - Technical validation
- **Badge** - Achievement system
- **Match** - Matching system (ready for activation)

---

## 💰 Revenue Model

### Payment Flow
1. Company discovers VAs through marketplace
2. Mutual interest creates match opportunity
3. Company pays $29.99 to unlock contact information
4. Stripe processes payment, platform takes 10% ($3.00)
5. Contact information exchanged between parties
6. Net revenue: $26.99 per successful match

### Revenue Streams
| Stream | Price | Status |
|--------|--------|--------|
| Contact Unlock | $29.99/match | 🔄 Ready |
| Platform Fee | 10% of transactions | ✅ Active |
| Premium Profiles | $20/month | 📝 Planned |
| Job Posting Fees | $10-50/listing | 📝 Planned |

---

## 🧪 Testing Strategy

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run specific suites
npm test -- --testNamePattern="auth"
npm test -- --testNamePattern="profiles"
npm test -- --testNamePattern="payments"
```

### Integration Tests
```bash
# Platform-wide health checks
./test-platform.sh

# Authentication flow
./test-week1-auth.sh

# Profile functionality
./test-week2-profiles.sh
```

---

## 🎯 Development Workflow

### Code Style Guidelines
- **TypeScript**: Strict mode enabled, explicit return types
- **React**: Functional components with hooks
- **API Routes**: RESTful design, proper HTTP status codes
- **Error Handling**: Consistent error responses
- **Naming**: camelCase for variables/functions, PascalCase for components

### Git Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run full test suite
4. Create pull request with description
5. Code review required before merge
6. Deploy to production via automated scripts

---

## 🆘 Common Issues and Solutions

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.2-database.yml ps

# Restart database
docker-compose -f docker-compose.2-database.yml restart

# Check connection string
printenv DATABASE_URL
```

### Firebase Authentication Issues
- Verify Firebase project configuration in console
- Check service account credentials
- Ensure environment variables are set
- Use debug script: `./scripts/debug-auth.sh`

### TypeScript Compilation Errors
- All TS2339, TS2322, TS2307 errors resolved
- Verify imports use correct file extensions
- Check for duplicate definitions

---

## 📱 Mobile App (Planned)

Status: **Documentation Complete** - Ready for implementation

See `docs/MOBILE_IMPLEMENTATION_GUIDE.md` for:
- React Native architecture
- Biometric authentication
- Offline-first data layer
- Swipe-based UI components
- Push notification integration

---

## 📚 Documentation Reference

### Core Guides
- **[../README.md](../README.md)** - Main platform documentation
- **[CORE_IMPLEMENTATION_GUIDE.md](CORE_IMPLEMENTATION_GUIDE.md)** - Core features
- **[SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md)** - Security fixes
- **[MOBILE_IMPLEMENTATION_GUIDE.md](MOBILE_IMPLEMENTATION_GUIDE.md)** - Mobile specs
- **[UNIFIED_DATABASE_IMPLEMENTATION.md](UNIFIED_DATABASE_IMPLEMENTATION.md)** - DB strategy

### Deployment & Operations
- **[PRODUCTION_DEPLOYMENT_SUCCESS.md](PRODUCTION_DEPLOYMENT_SUCCESS.md)** - Deployment records
- **[MVP_LAUNCH_CHECKLIST.md](MVP_LAUNCH_CHECKLIST.md)** - Launch readiness
- **[PLATFORM_COMPLETE_HISTORY.md](PLATFORM_COMPLETE_HISTORY.md)** - Development milestones

### Architecture
- **[../backend/SEPARATION_OF_CONCERNS.md](../backend/SEPARATION_OF_CONCERNS.md)** - SoC architecture
- **[../REFACTORING_COMPLETE.md](../REFACTORING_COMPLETE.md)** - Refactoring summary

---

## 🎯 CORE NARRATIVE: SERVING THE UNDERSERVED

BlytzWork is not just a hiring platform - we are building a **lifeline for overwhelmed professionals** who are drowning in their own success.

### The Real Vision
We serve **overwhelmed professionals** (35-44 year olds making $75-150K) who:
- Work 50+ hours/week and can't keep up
- Are paralyzed by decision fatigue from too many options
- Are intimidated by complex BPO/agency processes
- Need help but don't know where to start
- Feel shame about not being able to "handle it all"

### What "Underserved" Means to Us
- **Upwork ignores them** because they need hand-holding that kills self-service margins
- **BPOs reject them** because they're too small for enterprise minimums
- **Enterprise solutions** overwhelm them with complexity they don't need

### Our Competitive Moat: Empathy at Scale
We don't optimize for **transactions** like Upwork or **contracts** like BPOs. We optimize for **transformation** - helping people go from "drowning" to "in control" in 7 days or less.

### The Language We Speak
- **Not**: "We provide efficient staffing solutions"
- **But**: "What if you could breathe again?"
- **Not**: "AI-powered matching algorithm"
- **But**: "We understand that hiring someone feels like adding another full-time job to your already impossible schedule"

### Metrics That Matter to Us
- Hours worked per week (before/after)
- Stress level (1-10 scale)
- Family time increase
- "Do you feel in control again?" (yes/no)
- **Not**: Platform engagement time or feature usage

### Our Promise
We help overwhelmed professionals hire qualified virtual assistants in 7 days or less, with guaranteed quality and transparent pricing. We give people **permission to not be superhuman** and charge premium for that transformation.

---

## 📈 Progress Summary

### Backend (95% Complete)
- ✅ Server infrastructure
- ✅ Authentication system
- ✅ Profile management
- ✅ Contract management
- ✅ Real-time chat
- ✅ File upload system
- ✅ Health monitoring
- ✅ Separation of Concerns
- ✅ Security hardening
- 🔄 Payment routes (ready for activation)
- 🔄 Job marketplace (ready for activation)

### Frontend (85% Complete)
- ✅ Authentication pages
- ✅ Employer dashboard
- ✅ VA dashboard
- ✅ Role selection
- ✅ Navigation system
- ✅ UI component library
- ✅ Responsive design
- ✅ Firebase integration
- 🔄 Chat interface
- 🔄 Profile creation forms

### Infrastructure (90% Complete)
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Traefik reverse proxy
- ✅ SSL/HTTPS certificates
- ✅ Dokploy deployment
- ✅ Health checks
- 🟡 Frontend unhealthy (needs fix)
- 🔄 Monitoring dashboard

---

## 🎯 Next Steps

### Immediate (1-2 weeks)
1. Fix frontend container health check
2. Activate payment routes (remove .disabled)
3. Activate job marketplace routes
4. Complete end-to-end testing

### Short Term (1-3 months)
1. Begin React Native mobile app
2. Implement advanced matching algorithms
3. Set up comprehensive monitoring
4. Deploy to app stores

### Long Term (3-6 months)
1. Scale for enterprise clients
2. Add advanced analytics
3. Implement API marketplace
4. International expansion

---

## 📧 Environment Variables

Key environment variables (see `.env.example`):

### Backend
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Frontend
```
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

---

**Last Updated**: December 30, 2025  
**Platform Status**: 🚀 Production-Ready (88% Complete)  
**Version**: 1.0.0  

---

*This guide is intended for AI coding agents working on the BlytzWork platform. For questions or clarifications, refer to codebase comments and documentation before making assumptions about project structure or implementation details.*
