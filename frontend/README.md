# VA Matching Platform Frontend

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 3. Development Server
```bash
npm run dev
```

## Key Features Implemented
✅ Next.js 16 with App Router
✅ Firebase Authentication
✅ TailwindCSS styling
✅ React Hook Form + Zod validation
✅ TanStack Query for data fetching
✅ Stripe payment integration
✅ Responsive design

## Pages Structure
- `/auth` - Login/Signup
- `/va/profile` - VA profile creation/editing
- `/va/matches` - VA matches view
- `/company/profile` - Company profile
- `/company/jobs` - Job postings management
- `/company/discover` - Swipe interface for finding VAs
- `/company/matches` - Company matches with payment

## Payment Flow
1. Company discovers VAs through swipe interface
2. Mutual match triggers payment requirement
3. Company pays $29.99 via Stripe Checkout
4. Contact information exchanged between parties
5. Platform takes 10% fee

## Environment Variables Required
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_FIREBASE_*`: Firebase config
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key

## Tech Stack
- **Framework**: Next.js 16
- **Styling**: TailwindCSS 4.1
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Auth**: Firebase Auth
- **Payments**: Stripe
- **Icons**: Lucide React