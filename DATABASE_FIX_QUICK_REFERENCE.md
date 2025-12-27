# Database Schema Fix - Quick Reference

## The Problem

**Symptom:** New Firebase users can't authenticate - getting 401/404 errors from `/api/auth/profile`

**Root Cause:** DATABASE_URL was using `?schema=blytz_hire` which doesn't work with PostgreSQL's search_path

## The Solution

### 1. Update DATABASE_URL Format

**OLD (doesn't work):**
```
postgresql://user:pass@host:5432/blytz_work?schema=blytz_hire
```

**NEW (works correctly):**
```
postgresql://user:pass@host:5432/blytz_work?options=-c%20search_path=blytz_hire
```

**Key difference:** Use `options=-c%20search_path=blytz_hire` instead of `schema=blytz_hire`

### 2. Auto-Create Users on Login

Modified `/backend/src/routes/auth.ts` - `/api/auth/profile` endpoint now:
- Checks if user exists in database
- If not, creates user automatically with:
  - Firebase UID as ID
  - Email from Firebase token
  - Default role: 'va'
  - `profileComplete: false`
- Returns user profile immediately

### 3. Files Changed

1. **backend/src/routes/auth.ts** - Auto-user creation
2. **.env.example** - Updated DATABASE_URL format
3. **LONG_TERM_DATABASE_SOLUTION.md** - Comprehensive documentation

## Action Required

### For Production (Dokploy)

1. Go to backend service environment variables
2. Update DATABASE_URL:
   - Find: `?schema=blytz_hire`
   - Replace with: `?options=-c%20search_path=blytz_hire`
3. Save and redeploy backend service

### For Local Development

```bash
# .env file
DATABASE_URL="postgresql://blytz_user:password@localhost:5432/blytz_work?options=-c%20search_path=blytz_hire"
```

### Regenerate Prisma Client

```bash
cd backend
npx prisma generate
```

## Verification

```bash
# 1. Test database connection
docker exec blytzwork-postgres psql -U blytz_user -d blytz_work \
  -c "SET search_path TO blytz_hire; SELECT COUNT(*) FROM users;"

# 2. Test backend connection
# Check logs for "✅ Database connected successfully"

# 3. Test new user signup
# - Create new Firebase user
# - Login to app
# - Should work immediately (no 401 error)
# - Check logs for "✅ Auto-created user in database: ..."
```

## Database Structure

```
blytz_work (database)
├── blytz_hire (schema) ← Production tables
│   ├── users
│   ├── va_profiles
│   ├── companies
│   └── ... (17 models)
└── public (schema) ← Legacy tables
    ├── users
    └── ... (26 tables)
```

## Why This Works

1. **PostgreSQL search_path**: The `options=-c search_path=blytz_hire` parameter sets PostgreSQL's search path for the connection
2. **Transparent to Prisma**: Prisma doesn't need to know about schemas - PostgreSQL handles table lookup
3. **No chicken-and-egg**: Users are auto-created on first login from Firebase data

## Next Steps

1. ✅ Update DATABASE_URL in Dokploy (YOU NEED TO DO THIS)
2. ✅ Test with new Firebase user signup
3. ✅ Monitor backend logs for errors
4. ✅ Consider migrating legacy data from public schema

---

**Status:** Solution implemented, awaiting DATABASE_URL update in production
**Documentation:** See `LONG_TERM_DATABASE_SOLUTION.md` for detailed explanation
