# Hyred Platform - AI Agent Development Guide

## 🚀 Build, Lint, and Test Commands

### Backend (Fastify)
```bash
cd backend
npm run dev                 # Build and start backend server
npm run dev:debug           # Start with debug logging
npm run build               # Compile TypeScript to dist/
npm run start               # Run compiled server from dist/
npm run generate            # Generate Prisma client
npm run migrate             # Run migrations in dev mode
npm run db:push             # Push schema changes to DB
npm run db:studio           # Open Prisma Studio
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Run with coverage report
# Single test:
npm test -- --testNamePattern="describe name"
npm test -- tests/api.test.ts
npm test -- --testNamePattern="should create"
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev                 # Start Next.js dev server (localhost:3000)
npm run build               # Production build with Webpack
npm run start               # Start production server
npm run lint                # Run ESLint
```

### Docker & Database
```bash
docker-compose -f docker-compose.1-infrastructure.yml up -d
docker-compose -f docker-compose.2-database.yml up -d
npx prisma migrate deploy   # Apply migrations (production)
npx prisma migrate reset    # Reset database (dev only)
npx prisma studio           # Open database browser
```

## 🎨 Code Style Guidelines

### Import Ordering
```typescript
// 1. External libraries
import { FastifyInstance } from "fastify";
import { z } from "zod";

// 2. Internal modules (from src/)
import { prisma } from "../utils/prisma.js";
import { verifyAuth } from "../plugins/firebaseAuth.js";

// 3. Relative imports (./ or ../)
import { ApiResponse } from "./response.js";
```

### TypeScript Types
- **Backend**: Use `.js` extensions for imports (ES modules)
- **Frontend**: No extensions for imports (Next.js handles it)
- **Explicit types**: Always annotate function parameters and return types for public APIs
- **Zod schemas**: Use `z.infer<SchemaName>` to generate types

### Naming Conventions
- **Variables/functions**: camelCase (e.g., `getUserProfile`, `isLoading`)
- **Components**: PascalCase (e.g., `Button`, `UserProfileCard`)
- **Constants/Enums**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`, `UserRole`)
- **Files/Interfaces**: PascalCase (e.g., `UserProfile.ts`, `ApiResponse`)
- **Database models**: PascalCase in Prisma schema (e.g., `VAProfile`, `JobPosting`)
- **API routes**: kebab-case (e.g., `/auth/profile`, `/api/va/profile`)

### Error Handling

#### Backend (Fastify)
```typescript
app.get("/api/endpoint", async (request, reply) => {
  try {
    const data = await someOperation();
    return { success: true, data };
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return reply.code(404).send({ error: "Resource not found", code: "RESOURCE_NOT_FOUND" });
    }
    return reply.code(500).send({ error: "Internal server error", code: "INTERNAL_ERROR", details: error.message });
  }
});
```

#### Frontend (React)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    await apiCall('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
  } catch (error: any) {
    setError(error.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};
```

### Validation Patterns

#### Backend (Zod)
```typescript
const createProfileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  skills: z.array(z.string()).min(1)
});

app.post("/api/profile", async (request, reply) => {
  try {
    const validatedData = createProfileSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: "Validation failed", code: "VALIDATION_ERROR", details: error.errors });
    }
  }
});
```

#### Frontend (React Hook Form + Zod)
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({ resolver: zodResolver(createProfileSchema), defaultValues: { name: '', email: '', skills: [] } });
```

### Component Patterns

#### Backend (Fastify)
```typescript
export default async function routes(app: FastifyInstance) {
  app.get("/api/endpoint", { preHandler: [verifyAuth] }, async (request, reply) => {
    const user = request.user as any;
  });
}
```

#### Frontend (React/Next.js)
```typescript
'use client';
import { useState, useEffect } from 'react';

export function MyComponent({ prop }: { prop: string }) {
  const [state, setState] = useState('');
  useEffect(() => {}, [prop]);
  return <div>{state}</div>;
}
```

### Database Patterns (Prisma)
```typescript
const user = await prisma.user.findUnique({ where: { id: userId }, include: { vaProfile: true } });
const profiles = await prisma.vAProfile.findMany({ where: { availability: true }, orderBy: { hourlyRate: 'asc' }, take: 20 });
await prisma.$transaction([prisma.user.create({ data: userData }), prisma.vAProfile.create({ data: profileData })]);
```

### Testing Patterns
```typescript
describe('API Endpoint', () => {
  let testUser: any;
  beforeAll(async () => {
    testUser = await prisma.user.create({ data: testData });
  });

  it('should return data successfully', async () => {
    const response = await request(app.server).get('/api/endpoint').expect(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Expected Name');
  });
});
```

## 🔐 Security Requirements
- **NEVER** hardcode credentials or API keys
- **ALWAYS** validate inputs with Zod schemas
- **ALWAYS** use `verifyAuth` middleware on protected routes
- **NEVER** expose sensitive data in error messages
- **ALWAYS** use parameterized queries (Prisma handles this)
- **ALWAYS** sanitize user inputs before rendering (React escapes by default)

## 📝 File Organization
- **Backend routes**: `backend/src/routes/` (one file per domain)
- **Backend utils**: `backend/src/utils/` (prisma, validation, errors)
- **Frontend components**: `frontend/src/components/` (group by feature)
- **Frontend pages**: `frontend/src/app/` (Next.js App Router)
- **Tests**: `backend/tests/` and `frontend/tests/`
