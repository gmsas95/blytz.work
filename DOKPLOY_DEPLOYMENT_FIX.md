# Dokploy Deployment Fix Guide

## Problem Analysis

The "Compose file not found" error when deploying with Dokploy using `docker-compose.consolidated.yml` can occur due to several reasons:

1. **External Network Dependency**: The original file uses an external `dokploy-network` that may not exist
2. **File Path Issues**: Dokploy might be looking in the wrong directory
3. **Environment Variables**: Missing or incorrect environment variables

## Solution Steps

### Step 1: Use the Fixed Docker Compose File

We've updated `docker-compose.yml` with the following improvements:

1. **Changed to Internal Network**: Replaced external `dokploy-network` with internal `blytzwork-network`
2. **Added Default Values**: Provided sensible defaults for environment variables
3. **Simplified Configuration**: Removed dependencies on external infrastructure

### Step 2: Update Dokploy Configuration

In your Dokploy dashboard, update the deployment configuration:

1. **Compose File Path**: Use `./docker-compose.yml` as the single source of truth
2. **Working Directory**: Ensure it's set to the project root directory
3. **Environment Variables**: Add all required environment variables (see list below)

### Step 3: Required Environment Variables

Add these environment variables in your Dokploy application settings:

#### Database Configuration
```
DATABASE_URL=postgresql://postgres:blytzwork_secure_password_2024@postgres:5432/blytzwork
REDIS_URL=redis://redis:6379
POSTGRES_DB=blytzwork
POSTGRES_USER=postgres
POSTGRES_PASSWORD=blytzwork_secure_password_2024
```

#### Firebase Configuration
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Application Configuration
```
API_URL=https://gateway.blytz.work
FRONTEND_URL=https://blytz.work
NEXT_PUBLIC_API_URL=https://gateway.blytz.work/api
NEXT_PUBLIC_APP_URL=https://blytz.work
ALLOWED_ORIGINS=https://blytz.work,https://staging.blytz.work,https://www.blytz.work
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
```

### Step 4: Alternative Solutions

If the fixed file doesn't work, try these alternatives:

#### Option A: Use Standard Docker Compose
1. Change the compose file path to `./docker-compose.yml`
2. Update environment variables accordingly

#### Option B: Create External Network First
If you prefer to use the original `docker-compose.consolidated.yml`:

1. SSH into your server
2. Create the external network:
   ```bash
   docker network create dokploy-network
   ```
3. Retry the deployment

#### Option C: Use Multi-Stage Deployment
1. First deploy infrastructure:
   ```bash
   docker-compose -f docker-compose.1-infrastructure.yml up -d
   ```
2. Then deploy the application:
   ```bash
   docker-compose -f docker-compose.2-database.yml up -d
   docker-compose -f docker-compose.3-applications.yml up -d
   ```

### Step 5: Verify Deployment

After deployment, verify all services are running:

1. **Check Container Status**:
   ```bash
   docker-compose -f docker-compose.yml ps
   ```

2. **Check Health Status**:
   ```bash
   docker-compose -f docker-compose.yml exec blytzwork-backend curl -f http://localhost:3000/health
   docker-compose -f docker-compose.yml exec blytzwork-frontend curl -f http://localhost:3001/
   ```

3. **Check Logs**:
   ```bash
   docker-compose -f docker-compose.yml logs blytzwork-backend
   docker-compose -f docker-compose.yml logs blytzwork-frontend
   ```

## Troubleshooting

### Common Issues and Solutions

1. **"Compose file not found" Error**
   - Verify the file path in Dokploy is correct
   - Ensure the file exists in the project root
   - Check file permissions

2. **Network Errors**
   - Use the fixed version with internal network
   - Or create the external network manually

3. **Environment Variable Errors**
   - Double-check all required variables are set
   - Ensure no syntax errors in variable values
   - Verify special characters are properly escaped

4. **Build Failures**
   - Check Dockerfile paths are correct
   - Verify build context is set to project root
   - Check for missing dependencies

## Quick Fix Command

If you have SSH access to the server, you can try this quick fix:

```bash
# Navigate to project directory
cd /path/to/your/project

# Create external network (if using original file)
docker network create dokploy-network

# Or use the standard file directly
docker-compose -f docker-compose.yml up -d --build

# Check status
docker-compose -f docker-compose.yml ps
```

## Next Steps

1. Try deploying with the fixed compose file first
2. If that fails, use the minimal compose file
3. As a last resort, manually create the external network and use the original file
4. Always verify environment variables are correctly set in Dokploy

## Support

For additional support:
1. Check the Dokploy logs in the dashboard
2. Review container logs for specific error messages
3. Verify all environment variables are correctly formatted
4. Ensure all required files exist in the project directory