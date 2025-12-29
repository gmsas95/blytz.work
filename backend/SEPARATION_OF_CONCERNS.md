# Separation of Concerns (SoC) Architecture

## 🎯 Overview

This document describes the refactored architecture with proper Separation of Concerns (SoC) for the BlytzWork backend.

## 📁 Directory Structure

```
backend/src/
├── routes/              # HTTP Layer (Thin, ~50-100 lines each)
│   ├── auth.ts
│   ├── va.ts
│   ├── company.ts
│   ├── payments.ts
│   ├── contracts.ts
│   └── ...
├── services/            # Business Logic Layer (~150-300 lines each)
│   ├── index.ts         # Export all services
│   ├── authService.ts    # User operations, auth logic
│   ├── paymentService.ts # Payment processing, fees
│   ├── contractService.ts # Contracts, milestones
│   ├── jobService.ts     # Jobs, proposals
│   ├── profileService.ts # Profile CRUD, completion
│   ├── notificationService.ts # Notifications
│   ├── emailService.ts   # Email operations
│   ├── contractHelpers.ts # Contract utilities
│   └── profileHelpers.ts # Profile utilities
├── repositories/         # Data Access Layer (~80-150 lines each)
│   ├── index.ts         # Export all repositories
│   ├── userRepository.ts     # User data operations
│   ├── contractRepository.ts  # Contract data operations
│   ├── paymentRepository.ts  # Payment data operations
│   ├── jobRepository.ts      # Job data operations
│   ├── companyRepository.ts  # Company data operations
│   └── vaProfileRepository.ts  # VA profile data operations
├── utils/              # Pure utilities (no business logic)
│   ├── validation.ts     # Zod schemas
│   ├── errors.ts        # Error handling
│   ├── response.ts      # Response formatting
│   ├── prisma.ts        # Database connection
│   ├── s3.ts           # S3 operations
│   └── stripe.ts        # Stripe utilities
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## 🏗️ Architecture Layers

### 1. Routes Layer (HTTP Layer)
**Responsibility**: Handle HTTP requests/responses only

**Rules**:
- 50-100 lines maximum per file
- Only HTTP concerns (validation, request parsing, response formatting)
- Delegate all business logic to services
- No direct database access

**Example**:
```typescript
app.get("/auth/profile", {
  preHandler: [verifyAuth]
}, async (request, reply) => {
  const user = request.user as any;
  const profile = await authService.getProfile(user.uid);
  return { success: true, data: profile };
});
```

### 2. Services Layer (Business Logic Layer)
**Responsibility**: Implement business rules and orchestration

**Rules**:
- 150-300 lines per file
- All business logic and validation
- Orchestrate multiple repositories
- Call external services (Stripe, Firebase, Email)
- No HTTP concerns

**Example**:
```typescript
export class AuthService {
  async updateRole(uid: string, role: 'va' | 'company') {
    if (!['va', 'company'].includes(role)) {
      throw new ValidationError("Invalid role");
    }

    return await this.userRepo.updateRole(uid, role);
  }
}
```

### 3. Repositories Layer (Data Access Layer)
**Responsibility**: Database operations only

**Rules**:
- 80-150 lines per file
- Only Prisma ORM calls
- No business logic
- No HTTP concerns
- Return raw data (no transformation)

**Example**:
```typescript
export class UserRepository {
  async findByUid(uid: string) {
    return await prisma.user.findUnique({
      where: { id: uid }
    });
  }

  async updateRole(uid: string, role: string) {
    return await prisma.user.update({
      where: { id: uid },
      data: { role }
    });
  }
}
```

## 🔄 Request Flow

```
HTTP Request
    ↓
Routes Layer
    ├─ Validate request
    ├─ Parse body/params
    ├─ Call service
    └─ Format response
    ↓
Services Layer
    ├─ Business validation
    ├─ Execute business rules
    ├─ Call repositories
    ├─ Call external services
    └─ Return result
    ↓
Repositories Layer
    ├─ Execute Prisma queries
    ├─ Return raw data
    └─ No transformation
    ↓
Database (PostgreSQL)
```

## ✅ Benefits

### For Developers
- **Easy navigation**: Know exactly where to find code
- **Independent testing**: Test services without HTTP
- **Less cognitive load**: Each file has single responsibility
- **Clear handover**: New developers understand structure quickly

### For Maintainability
- **Change DB?** Update repositories only
- **Change business rules?** Update services only
- **Change API?** Update routes only
- **Add caching?** Add at repository layer

### For Testing
- **Unit tests**: Test services in isolation (mock repositories)
- **Integration tests**: Test with real repositories
- **E2E tests**: Test full HTTP flow

## 📊 Refactoring Progress

### Completed (Phase 1)
- ✅ Repository layer created (6 repositories)
- ✅ Service layer created (8 services)
- ✅ Moved helpers to services directory
- ✅ Refactored auth routes example
- ✅ Refactored VA routes example

### Remaining (Phase 2-3)
- ⏳ Refactor contracts.ts (1,055 → 150 lines)
- ⏳ Refactor payments.ts (883 → 100 lines)
- ⏳ Refactor jobMarketplace.ts (797 → 100 lines)
- ⏳ Refactor company.ts (432 → 80 lines)
- ⏳ Refactor companyProfiles.ts (433 → 80 lines)
- ⏳ Refactor upload.ts (291 → 80 lines)
- ⏳ Add comprehensive unit tests
- ⏳ Update API documentation

## 🚀 Usage Examples

### Creating a Service
```typescript
// services/customService.ts
export class CustomService {
  private customRepo: CustomRepository;

  constructor(customRepo?: CustomRepository) {
    this.customRepo = customRepo || new CustomRepository();
  }

  async doSomething(id: string) {
    // Business logic here
    const item = await this.customRepo.findById(id);

    if (!item) {
      throw new Error('Item not found');
    }

    // Business rules
    if (item.status !== 'active') {
      throw new Error('Item is not active');
    }

    return item;
  }
}
```

### Using a Service in Routes
```typescript
import { CustomService } from '../services/customService.js';

export default async function customRoutes(app: FastifyInstance) {
  const customService = new CustomService();

  app.get("/custom/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const result = await customService.doSomething(id);
      return { success: true, data: result };
    } catch (error: any) {
      return reply.code(404).send({
        error: error.message,
        code: "NOT_FOUND"
      });
    }
  });
}
```

## 🎯 Best Practices

### 1. Dependency Injection
Services accept repositories via constructor for testability:
```typescript
constructor(repo?: Repository) {
  this.repo = repo || new Repository();
}
```

### 2. Error Handling
Throw errors in services, catch in routes:
```typescript
// Service
if (!item) throw new Error('Not found');

// Route
try {
  const result = await service.doSomething(id);
} catch (error) {
  return reply.code(404).send({ error: error.message });
}
```

### 3. Validation
- Input validation in routes (Zod)
- Business validation in services
- Data validation in repositories (Prisma)

### 4. Transaction Management
Transactions in services when needed:
```typescript
await prisma.$transaction(async (tx) => {
  await this.contractRepo.create(data, tx);
  await this.paymentRepo.create(data, tx);
});
```

## 📝 Migration Checklist

When refactoring existing routes:

1. ✅ Create repository methods for all DB operations
2. ✅ Create service methods for business logic
3. ✅ Move business logic from route to service
4. ✅ Replace direct Prisma calls with service calls
5. ✅ Remove business logic from route
6. ✅ Test the refactored route
7. ✅ Delete old route file
8. ✅ Update server.ts to use new route

## 🎓 Next Steps for Developers

1. **Study the architecture** - Understand each layer's responsibility
2. **Review examples** - Look at auth-refactored.ts and va-refactored.ts
3. **Start refactoring** - Pick one route at a time
4. **Write tests** - Test services independently
5. **Document changes** - Update API docs as you go

---

**Last Updated**: December 29, 2025
**Branch**: refactor/separation-of-concerns
