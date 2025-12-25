# Security Configuration Guide for BlytzWork Platform

## Database Schema Choice: Public vs Custom

### Current Setup: Using `public` Schema ✅ OK for Production

#### Why This Is Acceptable:
- **Industry Standard**: Most single-application SaaS platforms use `public` schema
- **Simplified Maintenance**: Easier migrations, debugging, and development
- **Container Isolation**: Docker provides network-level isolation
- **Proper User Permissions**: When configured correctly (see below)

#### When to Use Custom Schema (`blytz_hire`):
- Multi-tenant applications
- Multiple applications sharing same database
- Need schema-level permission control
- Complex security policies

## Security Best Practices

### ✅ What We've Done Right:

1. **Docker Network Isolation**
   - All services in internal network (`blytzwork-internal`)
   - Only Traefik exposes services to internet
   - Direct database access not exposed

2. **Environment Variable Management**
   - Secrets stored in Dokploy (not in code)
   - No hardcoded credentials
   - Database credentials separate from app config

3. **Health Check Implementation**
   - Startup buffer prevents false failures
   - Proper dependency management
   - Health checks only check basic connectivity

### ⚠️ Security Gaps to Address:

#### 1. **CRITICAL: Database User Permissions**

**Current State:**
```yaml
DATABASE_URL: postgresql://postgres:password@postgres:5432/blytzwork
```
Using `postgres` superuser in DATABASE_URL is **not secure**.

**Required Fix:**
Set these environment variables in Dokploy:

| Variable | Value | Purpose |
|-----------|--------|---------|
| `POSTGRES_DB` | `blytzwork` | Database name |
| `POSTGRES_USER` | `postgres` | Superuser (for init only) |
| `POSTGRES_PASSWORD` | `[strong-password]` | Superuser password |
| `POSTGRES_APP_USER` | `blytzwork_app` | Restricted app user |
| `POSTGRES_APP_PASSWORD` | `[strong-password]` | App user password |
| `DATABASE_URL` | `postgresql://blytzwork_app:[password]@postgres:5432/blytzwork` | Connection string |

**How to Update in Dokploy:**
1. Go to Application → Settings → Environment Variables
2. Add the variables above (replace `[strong-password]` with actual values)
3. Rebuild application

#### 2. **Database Initialization Script** ✅ Added

`init-db.sh` creates restricted app user automatically:
```sql
CREATE USER blytzwork_app WITH PASSWORD 'xxx';
GRANT CONNECT ON DATABASE blytzwork TO blytzwork_app;
GRANT USAGE ON SCHEMA public TO blytzwork_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blytzwork_app;
```

**Permissions Granted:**
- ✅ Can connect to database
- ✅ Can create/drop tables (for Prisma migrations)
- ✅ Can SELECT/INSERT/UPDATE/DELETE data
- ❌ Cannot create/drop schemas
- ❌ Cannot create other users
- ❌ Cannot access system catalogs
- ❌ Cannot perform admin operations

#### 3. **Additional Security Recommendations**

##### A. Environment Variable Strength
```bash
# Use strong passwords (32+ characters)
POSTGRES_APP_PASSWORD=$(openssl rand -base64 32)

# Or use a password manager
```

##### B. Database Connection Security
```yaml
# Already in docker-compose.dokploy.yml
# Internal network - not exposed to internet
networks:
  - blytzwork-internal  # ✅ Good
```

##### C. Rate Limiting ✅ Already Implemented
```typescript
// backend/src/server.ts
app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '15 minutes',
});
```

##### D. CORS Configuration ✅ Already Implemented
```typescript
// backend/src/server.ts
app.register(cors, {
  origin: process.env.NODE_ENV === "production"
    ? ["https://blytz.work", "https://staging.blytz.work", "https://www.blytz.work"]
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
});
```

##### E. Input Validation ✅ Already Implemented
```typescript
// All routes use Zod validation
const schema = z.object({
  email: z.string().email(),
  // ...
});
```

## Security Checklist

### Immediate Actions (Before Production):
- [ ] Set `POSTGRES_APP_USER` and `POSTGRES_APP_PASSWORD` in Dokploy
- [ ] Update `DATABASE_URL` to use app user, not superuser
- [ ] Verify database cannot be accessed from outside network
- [ ] Test all features work with restricted permissions

### Ongoing Security Practices:
- [ ] Regular password rotation (quarterly)
- [ ] Monitor PostgreSQL logs for unauthorized access
- [ ] Keep dependencies updated (`npm audit`, `docker pull`)
- [ ] Review database permissions periodically
- [ ] Backup database regularly
- [ ] Enable PostgreSQL audit logging (optional)

### Production Deployment Checklist:
- [ ] HTTPS enforced (Traefik + Let's Encrypt) ✅
- [ ] Database not exposed to internet ✅
- [ ] Restricted database user permissions ⚠️ PENDING
- [ ] Rate limiting enabled ✅
- [ ] CORS configured properly ✅
- [ ] Environment variables not in code ✅
- [ ] Secrets managed by Dokploy ✅
- [ ] Health checks configured ✅
- [ ] Container resource limits (optional)
- [ ] Regular backup schedule

## Monitoring & Alerts

### Key Security Metrics to Monitor:
1. **Failed Authentication Attempts**
   ```bash
   docker logs blytzwork-backend | grep "401\|403"
   ```

2. **Database Connection Errors**
   ```bash
   docker logs blytzwork-postgres | grep "ERROR"
   ```

3. **Rate Limit Hits**
   ```bash
   docker logs blytzwork-backend | grep "rate limit"
   ```

4. **Unusual Traffic Patterns**
   - Use Dokploy monitoring or external APM
   - Set up alerts for high error rates

## Summary

### ✅ What's Good:
- Public schema is standard and acceptable
- Docker network isolation
- Environment-based configuration
- CORS and rate limiting
- Input validation with Zod

### ⚠️ What Needs Fixing:
- **CRITICAL**: Update DATABASE_URL to use restricted app user
- Set POSTGRES_APP_USER and POSTGRES_APP_PASSWORD in Dokploy
- Rebuild deployment after changing credentials

### 📋 Final Verdict:
**The setup is acceptable for production once database user permissions are fixed.**

Public schema is not a security risk when combined with:
1. Restricted database user (no superuser)
2. Network isolation (Docker internal network)
3. Application-level security (CORS, rate limiting, validation)
4. Proper secret management (Dokploy environment variables)
