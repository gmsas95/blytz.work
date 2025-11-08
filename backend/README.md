# VA Matching Platform Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate
```

### 4. Development Server
```bash
npm run dev
```

## API Documentation
- OpenAPI spec: `openapi.yaml`
- Health check: `GET /health`
- API endpoints: All prefixed with `/api`

## Key Features Implemented
✅ Firebase Authentication
✅ VA Profile CRUD
✅ Company & Job Posting CRUD
✅ Matching Algorithm
✅ Stripe Payments Integration
✅ Contact Unlock System
✅ Input Validation (Zod)
✅ Error Handling

## Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

## Database Schema
See `prisma/schema.prisma` for complete schema including:
- Users, VA Profiles, Companies
- Job Postings, Match Votes, Matches
- Payments with Stripe integration

## Payment Flow
1. Company likes VA → Match created
2. Company pays $29.99 to unlock contact
3. Payment processed via Stripe
4. Contact info exchanged between parties
5. Platform takes 10% fee