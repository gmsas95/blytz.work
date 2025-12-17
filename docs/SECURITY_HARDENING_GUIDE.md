# Security Hardening Guide

## Overview
This guide addresses security vulnerabilities identified in the Docker logs and provides a hardened configuration for production deployment.

## Security Issues Identified

### 1. Database Exposure
- **Problem**: PostgreSQL and Redis ports are exposed to the internet
- **Evidence**: Logs show unauthorized connection attempts from external IPs
- **Risk**: Brute force attacks, data breaches, service exploitation

### 2. Weak Authentication
- **Problem**: Default usernames and passwords being targeted
- **Evidence**: Failed login attempts for common usernames (postgres, admin, etc.)
- **Risk**: Unauthorized database access

### 3. Redis Security
- **Problem**: Redis instance without password protection
- **Evidence**: "Possible SECURITY ATTACK detected" in Redis logs
- **Risk**: Remote code execution, data theft

## Security Hardening Implementation

### 1. Network Isolation
**File**: `docker-compose.security-hardened.yml`

#### Changes Made:
- Removed external port exposure for PostgreSQL (port 5432)
- Removed external port exposure for Redis (port 6379)
- Only expose services through Traefik reverse proxy
- All database communication within Docker network only

#### Benefits:
- Database services not accessible from internet
- Reduced attack surface
- Centralized access control through reverse proxy

### 2. Authentication Hardening

#### PostgreSQL:
```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-blytzwork_user}  # Custom username
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Strong password from env
  POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"  # Strong auth method
```

#### Redis:
```yaml
command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
```

### 3. Security Options Applied

#### Container Security:
```yaml
security_opt:
  - no-new-privileges:true
```

#### Resource Limits:
```yaml
deploy:
  resources:
    limits:
      memory: 512M  # Prevent resource exhaustion attacks
    reservations:
      memory: 256M
```

### 4. Redis Configuration Hardening

**File**: `docker-compose.security-hardened.yml` (redis_config)

#### Security Features:
- Password authentication required
- Disabled dangerous commands (FLUSHDB, FLUSHALL, KEYS, CONFIG)
- Memory limits to prevent DoS attacks
- Bind to localhost only
- Protected mode enabled

## Deployment Instructions

### 1. Update Environment Variables

Create/update `.env` file with strong credentials:

```bash
# Database Credentials
POSTGRES_DB=blytzwork
POSTGRES_USER=blytzwork_user
POSTGRES_PASSWORD=your_strong_postgres_password_here

# Redis Credentials
REDIS_PASSWORD=your_strong_redis_password_here

# Update DATABASE_URL to include credentials
DATABASE_URL=postgresql://blytzwork_user:your_strong_postgres_password_here@postgres:5432/blytzwork

# Update REDIS_URL to include password
REDIS_URL=redis://:your_strong_redis_password_here@redis:6379
```

### 2. Deploy Security Hardened Configuration

```bash
# Stop current services
docker-compose down

# Deploy with security-hardened configuration
docker-compose -f docker-compose.security-hardened.yml up -d

# Verify services are running
docker-compose -f docker-compose.security-hardened.yml ps
```

### 3. Update Traefik Configuration

Ensure `dokploy.yml` includes the new Traefik labels from the security-hardened compose file.

### 4. Verify Security

#### Test Database Isolation:
```bash
# Should fail - ports not exposed
telnet your-server-ip 5432
telnet your-server-ip 6379

# Should succeed - through reverse proxy
curl -I https://gateway.blytz.work/health
curl -I https://blytz.work
```

#### Test Authentication:
```bash
# Check Redis requires password
docker exec blytzwork-redis redis-cli ping
# Should return: NOAUTH Authentication required

# Check with password
docker exec blytzwork-redis redis-cli -a your_redis_password ping
# Should return: PONG
```

## Ongoing Security Measures

### 1. Monitoring
- Set up log monitoring for failed authentication attempts
- Monitor for unusual network traffic patterns
- Track resource usage anomalies

### 2. Regular Updates
- Keep Docker images updated
- Apply security patches promptly
- Review and rotate credentials regularly

### 3. Backup Security
- Encrypt database backups
- Store backups securely
- Test backup restoration procedures

### 4. Network Security
- Implement firewall rules
- Use VPN for administrative access
- Monitor network traffic

## Migration Steps

### From Current Configuration:

1. **Backup Current Data**:
```bash
# Backup PostgreSQL
docker exec blytzwork-postgres pg_dump -U postgres blytzwork > backup.sql

# Backup Redis
docker exec blytzwork-redis redis-cli --rdb backup.rdb
```

2. **Update Environment**:
   - Set strong passwords in `.env`
   - Update connection strings

3. **Deploy New Configuration**:
   - Use `docker-compose.security-hardened.yml`
   - Verify all services start correctly

4. **Test Functionality**:
   - Test application authentication
   - Verify API endpoints work
   - Check database connectivity

## Security Checklist

- [ ] Strong passwords set for all services
- [ ] Database ports not exposed externally
- [ ] Redis password authentication enabled
- [ ] Dangerous Redis commands disabled
- [ ] Container security options applied
- [ ] Resource limits configured
- [ ] Traefik reverse proxy configured
- [ ] SSL certificates enabled
- [ ] Log monitoring in place
- [ ] Backup procedures tested
- [ ] Firewall rules configured

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Check `DATABASE_URL` includes correct credentials
   - Verify PostgreSQL container is healthy
   - Ensure network connectivity

2. **Redis Connection Failed**:
   - Verify `REDIS_PASSWORD` matches in all services
   - Check Redis container health
   - Confirm password in connection string

3. **Services Not Accessible**:
   - Verify Traefik configuration
   - Check SSL certificates
   - Confirm DNS resolution

### Recovery Procedures:

1. **If Deployment Fails**:
```bash
# Revert to previous configuration
docker-compose down
docker-compose up -d
```

2. **If Database Access Lost**:
```bash
# Access PostgreSQL container directly
docker exec -it blytzwork-postgres psql -U blytzwork_user -d blytzwork
```

3. **If Redis Access Lost**:
```bash
# Access Redis container directly
docker exec -it blytzwork-redis redis-cli -a your_redis_password
```

## Conclusion

This security hardening implementation:
- Eliminates external database exposure
- Implements strong authentication
- Adds container security options
- Configures resource limits
- Enables comprehensive monitoring

Deploy the security-hardened configuration to protect your production environment from the identified security threats.