# DATABASE_URL Configuration Guide

## The Issue

Prisma is trying to access the `public` schema in PostgreSQL, but all tables exist in the `blytz_hire` schema. This causes authentication errors like:

```
ERROR: relation "public.users" does not exist
```

## The Solution

Your `DATABASE_URL` environment variable in Dokploy MUST include the schema parameter.

### Correct DATABASE_URL Format

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?schema=blytz_hire
```

### Example

If your database connection details are:
- Host: postgres
- Port: 5432
- Database: blytz_work
- User: blytzwork_app
- Password: your_password

Your `DATABASE_URL` should be:

```
postgresql://blytzwork_app:your_password@postgres:5432/blytz_work?schema=blytz_hire
```

## How to Update in Dokploy

1. Go to your Dokploy dashboard
2. Select the `blytzwork-webapp-uvey24` application
3. Go to "Environment Variables" tab
4. Find the `DATABASE_URL` variable
5. Update it to include `?schema=blytz_hire` at the end

**Before (Wrong)**:
```
postgresql://blytzwork_app:password@postgres:5432/blytz_work
```

**After (Correct)**:
```
postgresql://blytzwork_app:password@postgres:5432/blytz_work?schema=blytz_hire
```

## Alternative Format (using search_path)

You can also use the PostgreSQL `search_path` option:

```
postgresql://blytzwork_app:password@postgres:5432/blytz_work?options=-c%20search_path=blytz_hire
```

Both formats work, but the `?schema=blytz_hire` format is simpler.

## Verification

After updating `DATABASE_URL`, redeploy the application. The logs should no longer show:

```
ERROR: relation "public.users" does not exist
```

Instead, authentication should work successfully.

## Why This Happens

- PostgreSQL has multiple schemas (namespaces for tables)
- Your tables are in `blytz_hire` schema
- By default, Prisma looks in `public` schema
- The `?schema=blytz_hire` parameter tells Prisma where to find your tables

## Related Files

- `backend/prisma/schema.prisma` - Prisma schema definition
- `docker-compose.dokploy.yml` - Docker compose configuration
- `.env` - Local environment variables (already configured correctly)
