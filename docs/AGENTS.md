# AGENTS.md

**IMPORTANT: Read CRUSH.md first for complete project documentation and deployment instructions.**

## Project Overview
BlytzHire is a VA (Virtual Assistant) matching platform connecting companies with talented VAs. The platform features profile creation, job postings, matching algorithms, contracts, and payment processing.

## Architecture
- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Auth (JWT verification)
- **Payments**: Stripe integration
- **Deployment**: Docker + Dokploy

## Development Commands

### Backend (Fastify + TypeScript)
```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run generate     # Generate Prisma client
npm run migrate      # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Docker Services
```bash
# Individual services
docker compose -f docker-compose.postgres.yml up
docker compose -f docker-compose.backend.yml up
docker compose -f docker-compose.frontend.yml up
docker compose -f docker-compose.nginx.yml up

# All services (when ready)
docker compose -f docker-compose.all.yml up
```

## Project Structure

### Backend (`/backend/`)
```
backend/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── plugins/               # Fastify plugins (auth, etc.)
│   ├── routes/                # API routes by feature
│   ├── utils/                 # Shared utilities
│   ├── usecases/              # Business logic layer
│   ├── infrastructure/        # External integrations
│   └── types/                 # TypeScript definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/                     # Jest test files
└── openapi.yaml               # API documentation
```

### Frontend (`/frontend/`)
```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and API clients
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
└── tailwind.config.ts         # Tailwind configuration
```

## Code Conventions

### TypeScript/JavaScript
- ES modules (`"type": "module"` in package.json)
- TypeScript strict mode enabled
- Use `.js` extensions for imports (required for ES modules)
- Files: kebab-case for routes/plugins, camelCase for utilities
- Variables/Functions: camelCase
- Database models: PascalCase
- API endpoints: kebab-case

### Backend (Fastify)
- Route structure: `src/routes/[feature].ts`
- Export route functions as default: `export default async function featureRoutes(app)`
- Use async/await consistently
- Error handling: `reply.code(401).send({ error: "message" })`
- Server entry: `src/server.ts`

### Frontend (Next.js)
- App Router structure: `src/app/[route]/page.tsx`
- Components in `src/components/` directory
- Custom hooks in `src/hooks/` directory
- Types in `src/types/` directory
- Use Tailwind CSS for styling

### Database (Prisma)
- Schema: `prisma/schema.prisma`
- Use `@default(cuid())` for primary keys
- Boolean fields default to `true` where appropriate
- Use `@@unique` constraints for composite keys
- All tables use `@@schema("blytz_hire")`

## Testing

### Backend Testing
- Framework: Jest with TypeScript support
- Test files: `tests/*.test.ts`
- Setup: `tests/setup.ts` (database cleanup)
- Run tests: `npm run test`
- Coverage: `npm run test:coverage`
- Test config: `jest.config.js` (ESM support)

### Test Patterns
- Use `describe` and `it` blocks
- Use `beforeEach` for database cleanup
- Export Prisma client from setup for tests
- Mock external services (Firebase, Stripe) when testing business logic

## Authentication & Authorization

### Firebase Auth Integration
- JWT verification middleware in `src/plugins/firebaseAuth.ts`
- Add user to request object: `request.user = decoded`
- User roles: "company" | "va"
- Required env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### Protected Routes
- Apply auth plugin to protected endpoints
- Validate user role in business logic
- Return 401 for missing/invalid tokens
- Return 403 for insufficient permissions

## Database Schema

### Core Models
- **User**: Base user model with Firebase auth integration
- **VAProfile**: Virtual Assistant profiles with skills, rates, portfolio
- **Company**: Company profiles with job postings
- **JobPosting**: Job listings with requirements and budget
- **Job**: Active contracts between companies and VAs
- **Contract**: Formal agreements with milestones and payments
- **Payment**: Financial transactions via Stripe

### Relationships
- User ↔ VAProfile (1:1)
- User ↔ Company (1:1)
- Company → JobPosting (1:N)
- VAProfile → Job (N:M via proposals)
- Job → Contract (1:N)
- Contract → Payment (N:M)

## Environment Variables

### Backend Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook verification
- `JWT_SECRET`: JWT signing secret
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

### Frontend Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase public API key
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## API Patterns

### Route Structure
```typescript
export default async function featureRoutes(app: any) {
  app.get("/feature", async (request, reply) => {
    // Implementation
  });
  
  app.post("/feature", async (request, reply) => {
    // Implementation
  });
}
```

### Response Format
- Success: Direct object/array or Fastify's default JSON response
- Error: `reply.code(statusCode).send({ error: "message" })`
- Validation errors: `reply.code(400).send({ error: validationErrors })`

### Validation
- Use Zod schemas for request validation
- Validate request body, query parameters, and path parameters
- Return 400 for validation failures

## Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev

# Database
docker compose -f docker-compose.postgres.yml up
```

### Production
- Use deployment script: `./deploy.sh`
- Docker Compose files for each service
- Nginx reverse proxy configuration
- Health check endpoint: `/health`

### Docker Services
- PostgreSQL: `docker-compose.postgres.yml`
- Backend API: `docker-compose.backend.yml`
- Frontend: `docker-compose.frontend.yml`
- Nginx: `docker-compose.nginx.yml`
- All services: `docker-compose.all.yml`

## Important Gotchas

### ES Modules
- Always use `.js` extensions in imports (even for `.ts` files)
- Package.json must have `"type": "module"`
- Jest config needs special ESM configuration

### Prisma
- Generate client after schema changes: `npm run generate`
- Use `@@schema("blytz_hire")` for all models
- Database URL must include schema name

### Firebase
- Private key format: Replace `\n` with actual newlines in environment
- JWT verification requires proper certificate handling
- Test with Firebase emulator when possible

### Testing
- Tests use separate database (configure `DATABASE_URL_TEST`)
- Cleanup database between tests in `setup.ts`
- Mock external services for unit tests

### Development Workflow
1. Run database migrations: `npm run migrate`
2. Generate Prisma client: `npm run generate`
3. Start backend: `npm run dev`
4. Start frontend: `npm run dev`
5. Run tests before committing: `npm run test`

## Business Logic

### VA Profiles
- Skills assessment and verification
- Portfolio management
- Rating and review system
- Availability tracking

### Job Matching
- Skill-based matching algorithm
- Mutual acceptance required (swipe interface)
- Proposal and bidding system
- Contract creation workflow

### Payment System
- Stripe integration for payments
- Milestone-based payments
- Platform fee calculation
- Refund handling

### Contract Management
- Contract creation and tracking
- Milestone management
- Timesheet approval
- Payment processing

## Common Issues & Solutions

### Import Errors
- Use `.js` extensions for all imports
- Check Jest module mapping configuration
- Verify TypeScript `moduleResolution` is set correctly

### Database Connection
- Ensure PostgreSQL is running
- Check `DATABASE_URL` includes schema name
- Run migrations before starting server

### Firebase Auth
- Verify environment variables are correctly formatted
- Check service account permissions
- Test JWT token format

### Docker Issues
- Build contexts: Use service-specific compose files
- Port conflicts: Check Docker Compose port mappings
- Volume permissions: Ensure proper file permissions

This guide provides essential information for working with the BlytzHire platform. Always refer to the existing codebase for specific implementation details and patterns.