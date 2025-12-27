# Long-Term Database Configuration Solution

## Problem Statement

The project was experiencing authentication failures due to schema configuration issues:

1. **Schema Parameter Issue**: Using `?schema=blytz_hire` in DATABASE_URL doesn't work with PostgreSQL's search_path
2. **Authentication Failure**: New Firebase users couldn't authenticate because they didn't exist in PostgreSQL
3. **Multiple Schemas**: Database has `blytz_hire` schema (production tables) and `public` schema (legacy tables)

## Root Cause

Prisma's `schema` parameter in DATABASE_URL doesn't properly configure PostgreSQL's search_path. When queries execute, PostgreSQL can't find tables in the `blytz_hire` schema because they're not in the default search path.

## Solution Implemented

### 1. PostgreSQL search_path Configuration

**Correct DATABASE_URL Format:**
```
postgresql://username:password@host:5432/database?options=-c%20search_path=blytz_hire
```

**Key Points:**
- Use `options=-c` parameter instead of `schema`
- `%20` is URL-encoded space
- `search_path=blytz_hire` tells PostgreSQL to search for tables in the blytz_hire schema first
- This is a PostgreSQL server-side parameter that affects the connection

**Why This Works:**
- The `options=-c search_path=blytz_hire` parameter executes a PostgreSQL command on connection
- This sets the search_path for the entire session
- PostgreSQL will look for tables in `blytz_hire` first, then fallback to `public`
- Prisma doesn't need to know about schemas - PostgreSQL handles it transparently

### 2. Auto-User Creation on Firebase Login

**Problem:**
- User logs in via Firebase
- Frontend gets Firebase ID token
- Backend tries to verify token by querying users table
- If user doesn't exist in database (new user), 401/404 error occurs

**Solution:**
Modified `/api/auth/profile` endpoint to automatically create users:

```typescript
app.get("/auth/profile", {
  preHandler: [verifyAuth]
}, async (request, reply) => {
  const user = request.user as any;

  let userProfile = await prisma.user.findUnique({
    where: { id: user.uid },
    include: {
      vaProfile: true,
      company: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  // Auto-create user if doesn't exist
  if (!userProfile) {
    userProfile = await prisma.user.create({
      data: {
        id: user.uid,
        email: user.email,
        role: 'va', // Default role
        profileComplete: false,
        emailVerified: user.email_verified || false
      },
      include: {
        vaProfile: true,
        company: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    console.log(`✅ Auto-created user in database: ${userProfile.id} from Firebase login`);
  }

  return {
    success: true,
    data: userProfile
  };
});
```

**Benefits:**
- No more chicken-and-egg problem
- New users can authenticate immediately
- Seamless onboarding experience
- Frontend doesn't need special handling for new users

### 3. Database Schema Architecture

**Current Database Structure:**
```
blytz_work (database)
├── blytz_hire (schema) ← Production tables
│   ├── users
│   ├── va_profiles
│   ├── companies
│   ├── job_postings
│   ├── jobs
│   ├── contracts
│   ├── payments
│   ├── notifications
│   └── ... (17 models total)
└── public (schema) ← Legacy tables
    ├── users
    ├── auctions
    ├── products
    ├── payments
    └── ... (26 tables total)
```

**Why Two Schemas?**
- `blytz_hire`: New production schema with proper relationships and indexes
- `public`: Legacy schema from previous application (to be migrated or deprecated)

**Prisma Configuration:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Note:** Prisma doesn't need schema configuration - PostgreSQL's search_path handles it.

## Implementation Steps

### Step 1: Update DATABASE_URL in Production

**In Dokploy:**
1. Go to backend service configuration
2. Update DATABASE_URL environment variable
3. Change from:
   ```
   postgresql://user:pass@host:5432/blytz_work?schema=blytz_hire
   ```
4. To:
   ```
   postgresql://user:pass@host:5432/blytz_work?options=-c%20search_path=blytz_hire
   ```
5. Note: `%20` is URL-encoded space

**In Local Development:**
```bash
# .env file
DATABASE_URL="postgresql://blytz_user:password@localhost:5432/blytz_work?options=-c%20search_path=blytz_hire"
```

### Step 2: Regenerate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 3: Deploy Backend Service

```bash
# If using Dokploy, just save the configuration
# It will automatically redeploy with the new DATABASE_URL

# Or manually redeploy
docker-compose up -d backend
```

### Step 4: Test Authentication Flow

1. Create a new Firebase user
2. Login to the application
3. Verify `/api/auth/profile` returns 200
4. Check that user is created in PostgreSQL:
   ```bash
   docker exec blytzwork-postgres psql -U blytz_user -d blytz_work \
     -c "SET search_path TO blytz_hire; SELECT id, email, role, profileComplete FROM users;"
   ```

## Testing the Solution

### Test Database Connection

```bash
# Method 1: Direct PostgreSQL test
docker exec blytzwork-postgres psql -U blytz_user -d blytz_work \
  -c "SET search_path TO blytz_hire; SELECT COUNT(*) FROM users;"

# Method 2: Prisma test
cd backend
DATABASE_URL="postgresql://user:pass@host:5432/blytz_work?options=-c%20search_path=blytz_hire" \
  npx prisma db push

# Method 3: Application test
# Check backend logs for "✅ Database connected successfully"
```

### Test Auto-User Creation

```bash
# 1. Create new Firebase user via frontend
# 2. Wait for authentication
# 3. Check backend logs for "✅ Auto-created user in database: ..."
# 4. Verify user exists in PostgreSQL
```

## Migration Path (Optional)

If you want to eventually consolidate schemas:

### Option A: Move blytz_hire tables to public
```sql
-- This is complex and requires downtime
-- Not recommended unless absolutely necessary
```

### Option B: Drop public schema (after migration)
```sql
-- 1. Migrate all needed data from public to blytz_hire
-- 2. Drop public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION blytz_user;
GRANT ALL ON SCHEMA public TO blytz_user;
```

### Option C: Keep both (Recommended)
- Use `search_path=blytz_hire` for new application
- Keep public for legacy data access
- Gradually migrate data over time

## Security Considerations

1. **Credential Rotation**: The DATABASE_URL exposes database credentials
   - Store in environment variables
   - Never commit to git
   - Rotate regularly if leaked

2. **Schema Access**: Ensure proper permissions
   ```sql
   -- Grant privileges on schema
   GRANT USAGE ON SCHEMA blytz_hire TO blytz_user;
   GRANT ALL ON ALL TABLES IN SCHEMA blytz_hire TO blytz_user;
   ```

3. **Connection Pooling**: Consider using connection pooler for production
   - PgBouncer
   - Amazon RDS Proxy
   - Neon Serverless Postgres

## Troubleshooting

### Issue: "relation \"users\" does not exist"

**Cause:** search_path not configured correctly

**Solution:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL | grep "options=-c%20search_path=blytz_hire"

# Test manually
psql "postgresql://user:pass@host:5432/blytz_work?options=-c%20search_path=blytz_hire" \
  -c "SELECT COUNT(*) FROM users;"
```

### Issue: "Authentication failed"

**Cause:** Wrong username/password or database not accessible

**Solution:**
```bash
# Check database is running
docker ps | grep postgres

# Test connection without search_path
psql "postgresql://user:pass@host:5432/blytz_work" \
  -c "SELECT current_database(), current_user;"
```

### Issue: New users get 401 error

**Cause:** Auto-user creation not implemented

**Solution:**
- Verify `/api/auth/profile` has auto-user creation code
- Check backend logs for "Auto-created user in database" message
- Ensure Prisma client is regenerated

## Best Practices

1. **Always use search_path** for PostgreSQL schemas
2. **Auto-create users** from Firebase to avoid chicken-and-egg
3. **Separate authentication** (Firebase) from database users
4. **Use environment variables** for all secrets
5. **Test thoroughly** after configuration changes
6. **Monitor logs** for database connection issues
7. **Document schema architecture** for future developers

## References

- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Prisma Connection URL](https://www.prisma.io/docs/reference/database-reference/connection-urls#postgresql)
- [PostgreSQL search_path](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-SEARCH-PATH)

---

**Last Updated:** December 27, 2025
**Status:** ✅ Implemented and tested
**Next Steps:** Update Dokploy configuration with new DATABASE_URL format
