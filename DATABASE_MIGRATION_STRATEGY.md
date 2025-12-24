# Database Migration Strategy

## Current State Analysis

### Shared Database Issues
- Single PostgreSQL database with 17+ interconnected models
- All services directly access same Prisma client
- Tight coupling through shared foreign keys
- No data ownership boundaries

## Target: Database-per-Service Architecture

### Service Database Mapping

#### 1. User Service Database (`users_db`)
**Owner Models**:
- User (core identity)
- VAProfile (with essential fields only)
- Company (with essential fields only)

**Shared Data Strategy**:
- Duplicate critical user info (id, email, role, name) in other services
- Use user ID as foreign key across services
- User service remains source of truth for identity

#### 2. Marketplace Service Database (`marketplace_db`)
**Owner Models**:
- JobPosting
- Proposal
- Job
- Match
- SkillsAssessment

**Shared Data**:
- User ID references (not full user objects)
- Basic VA/Company profile info (name, avatar)

#### 3. Contracts Service Database (`contracts_db`)
**Owner Models**:
- Contract
- Milestone
- Timesheet
- Invoice

**Shared Data**:
- User ID references (client, va, admin)
- Job posting reference (ID only)

#### 4. Payments Service Database (`payments_db`)
**Owner Models**:
- Payment
- Review
- Dispute
- Refund

**Shared Data**:
- User ID references
- Contract ID references
- Basic transaction amounts and statuses

#### 5. Communication Service Database (`communication_db`)
**Owner Models**:
- Notification
- ChatMessage (extracted from Notification)
- Conversation

**Shared Data**:
- User ID references (participants)
- Last message timestamps

#### 6. File Service Database (`files_db`)
**Owner Models**:
- PortfolioItem
- FileMetadata
- StorageReference

**Shared Data**:
- User ID references (owner)
- File URLs and metadata

## Migration Phases

### Phase 1: Database Setup & Data Analysis (Week 1)
```bash
# Create separate databases
CREATE DATABASE users_db;
CREATE DATABASE marketplace_db;
CREATE DATABASE contracts_db;
CREATE DATABASE payments_db;
CREATE DATABASE communication_db;
CREATE DATABASE files_db;

# Set up proper access controls
GRANT ALL PRIVILEGES ON users_db TO users_service;
GRANT ALL PRIVILEGES ON marketplace_db TO marketplace_service;
# etc.
```

**Tasks**:
1. Provision separate PostgreSQL databases
2. Create service-specific database users
3. Set up connection strings
4. Analyze current data dependencies

### Phase 2: Extract Communication Service Data (Week 2)
```sql
-- Create communication schema
CREATE TABLE communication_db.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Migrate existing notifications
INSERT INTO communication_db.notifications
SELECT * FROM blytz_hire.notifications;
```

**Tasks**:
1. Create communication-specific schema
2. Migrate notification/chat data
3. Update communication service to use new database
4. Test communication functionality

### Phase 3: Extract Payments Service Data (Week 3-4)
```sql
-- Create payments schema
CREATE TABLE payments_db.payments (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migrate payment data
INSERT INTO payments_db.payments
SELECT id, senderId, receiverId, amount, currency, status, 
       stripePaymentIntentId, createdAt
FROM blytz_hire.payments;
```

**Tasks**:
1. Create payments-specific schema
2. Migrate payment, review, and dispute data
3. Update payment service isolation
4. Implement cross-service data consistency checks

### Phase 4: Extract Marketplace Service Data (Week 5-6)
```sql
-- Create marketplace schema
CREATE TABLE marketplace_db.job_postings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  salary_range JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migrate marketplace data
INSERT INTO marketplace_db.job_postings
SELECT * FROM blytz_hire.jobPosting;
```

**Tasks**:
1. Create marketplace-specific schema
2. Migrate job postings, proposals, and matches
3. Update marketplace service to use new database
4. Implement proper job matching logic

### Phase 5: Extract Contracts Service Data (Week 7-8)
```sql
-- Create contracts schema
CREATE TABLE contracts_db.contracts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  va_id TEXT NOT NULL,
  terms JSONB,
  status TEXT DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migrate contract data
INSERT INTO contracts_db.contracts
SELECT * FROM blytz_hire.contracts;
```

**Tasks**:
1. Create contracts-specific schema
2. Migrate contracts, milestones, and timesheets
3. Update contract service isolation
4. Implement proper contract lifecycle management

### Phase 6: Split User Service (Week 9-10)
```sql
-- Clean user database
CREATE TABLE users_db.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_complete BOOLEAN DEFAULT FALSE,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migrate user data
INSERT INTO users_db.users
SELECT id, email, role, emailVerified, profileComplete, 
       preferences, createdAt, updatedAt
FROM blytz_hire.users;
```

**Tasks**:
1. Create clean user schema
2. Migrate core user identity data
3. Keep essential VA/Company profile info
4. Implement user service as single source of truth

## Cross-Service Data Synchronization

### Event-Driven Data Sync
```typescript
// User Service emits events
interface UserEvent {
  type: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED';
  userId: string;
  data: {
    id: string;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  };
  timestamp: Date;
}

// Other services subscribe to user events
class MarketplaceService {
  onUserUpdated(event: UserEvent) {
    // Update cached user info
    this.userCache.set(event.userId, event.data);
  }
}
```

### Data Consistency Patterns
1. **Eventual Consistency**: Accept temporary data inconsistencies
2. **Compensating Transactions**: Rollback cascading changes
3. **Saga Pattern**: Multi-step transaction coordination
4. **Read-Through Cache**: Cache user data in other services

### Shared Data Schema
```typescript
// Minimal user data shared across services
interface SharedUser {
  id: string;
  email: string;
  role: 'company' | 'va';
  name?: string;
  avatar?: string;
  verificationLevel?: string;
}

// Minimal VA profile data
interface SharedVAProfile {
  id: string;
  userId: string;
  name: string;
  hourlyRate: number;
  skills: string[];
  averageRating?: number;
  totalReviews: number;
}

// Minimal company data
interface SharedCompany {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  verificationLevel: string;
}
```

## Database Migration Tools & Scripts

### 1. Data Validation Script
```bash
#!/bin/bash
# validate-migration.sh

echo "Validating data migration..."

# Check record counts
ORIGINAL_COUNT=$(psql $OLD_DB -tAc "SELECT COUNT(*) FROM users")
NEW_COUNT=$(psql $USERS_DB -tAc "SELECT COUNT(*) FROM users")

if [ "$ORIGINAL_COUNT" -eq "$NEW_COUNT" ]; then
    echo "✅ User migration successful"
else
    echo "❌ User migration failed: count mismatch"
    exit 1
fi
```

### 2. Rollback Script
```bash
#!/bin/bash
# rollback-migration.sh

echo "Rolling back database migration..."

# Stop new services
docker-compose stop user-service marketplace-service

# Switch back to old database
export DATABASE_URL=$OLD_DATABASE_URL

# Restart monolith
docker-compose restart backend
```

### 3. Health Check Script
```bash
#!/bin/bash
# check-service-health.sh

SERVICES=("user-service" "marketplace-service" "contracts-service" "payments-service" "communication-service")

for service in "${SERVICES[@]}"; do
    response=$(curl -s "http://localhost:300${service##*-}/health")
    if [[ $response == *"healthy"* ]]; then
        echo "✅ $service is healthy"
    else
        echo "❌ $service is unhealthy"
        exit 1
    fi
done
```

## Testing Strategy

### 1. Migration Testing
- **Dry Runs**: Test migration scripts on copy of production data
- **Data Validation**: Compare record counts and key fields
- **Integration Tests**: Verify cross-service functionality
- **Performance Testing**: Measure query performance impact

### 2. Consistency Testing
- **Event Propagation**: Verify user updates sync across services
- **Race Conditions**: Test concurrent operations
- **Failure Scenarios**: Test service failure recovery
- **Data Integrity**: Verify foreign key relationships

### 3. Performance Testing
- **Query Latency**: Measure cross-service call performance
- **Load Testing**: Test system under realistic load
- **Connection Pooling**: Optimize database connections
- **Caching Effectiveness**: Measure cache hit rates

## Risk Mitigation

### 1. Data Loss Prevention
- Full database backups before each migration phase
- Point-in-time recovery capabilities
- Migration scripts with rollback functionality
- Data validation checks at each step

### 2. Service Availability
- Blue-green deployment strategy
- Feature flags for gradual rollout
- Monitoring and alerting setup
- Manual rollback triggers

### 3. Performance Impact
- Database query optimization
- Connection pooling configuration
- Caching strategies implementation
- Load testing before production

## Success Metrics

### Migration Success Criteria
- [ ] All services operational with own databases
- [ ] No data loss during migration
- [ ] Cross-service data consistency maintained
- [ ] Performance not degraded (>10% slower)
- [ ] Full rollback capability tested

### Post-Migration Benefits
- [ ] Independent service deployment
- [ ] Database-specific optimization
- [ ] Improved fault isolation
- [ ] Better scaling capabilities
- [ ] Enhanced development velocity

This migration strategy will transform your shared database into a proper database-per-service architecture while maintaining data integrity and system availability.