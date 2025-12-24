# Subdomain Migration Plan: blytz.work → app.blytz.work

## Current Issues Identified

### Onboarding Flow Problem
- ✅ Profile creation works in onboarding
- ✅ Success notification appears  
- ❌ Dashboard redirect fails - API response format mismatch
- 🐛 Dashboard expects `profileResponse.ok` but `apiCall()` returns Response object with `status` property

## Immediate Fix Applied

### Dashboard API Response Handling
```typescript
// Fixed: dashboard now checks status instead of .ok
if (profileResponse.status === 200) {
  const profileData = await profileResponse.json();
  setProfile(profileData.data);
} else {
  router.push('/va/profile/create');
  return;
}
```

## Subdomain Architecture Strategy

### Current Structure (Single Domain)
```
blytz.work/
├── / (landing page)
├── /auth (login/signup)
├── /va/* (VA onboarding, dashboard, profiles)
├── /employer/* (employer onboarding, dashboard)
├── /chat/* (real-time messaging)
└── /contract/* (contract management)
```

### Target Structure (Marketing + App Separation)
```
blytz.work/ (Marketing Site)
├── / (landing page)
├── /about
├── /pricing
├── /faq
├── /terms
└── /privacy

app.blytz.work/ (Application Platform)
├── /auth (login/signup)
├── /va/* (VA dashboard, profiles, onboarding)
├── /employer/* (employer dashboard, onboarding)
├── /chat/* (real-time messaging)
├── /contract/* (contract management)
└── /select-role (role selection)
```

## Migration Benefits

### 🎯 Marketing & App Separation
- **Clear User Journey**: Marketing → App separation
- **SEO Optimization**: Marketing site focuses on SEO, app focuses on functionality
- **Different Scaling**: Marketing can be static CDN, app needs dynamic infrastructure
- **Analytics Separation**: Marketing analytics vs product analytics

### 🔒 Security Benefits  
- **Isolated Domains**: App authentication isolated from public marketing
- **Cookie Security**: Secure cookies scoped to app.blytz.work only
- **CORS Simplification**: Clear domain boundaries for API calls
- **Content Security**: Different CSP policies for each domain

### 🚀 Technical Advantages
- **Independent Deployment**: Deploy app without affecting marketing site
- **Different Caching**: Marketing can be heavily cached, app needs session management
- **Performance**: Static marketing vs dynamic app optimization
- **Monitoring**: Separate monitoring and alerting

## Implementation Plan

### Phase 1: Prepare Frontend Structure (Week 1)

#### 1.1 Restructure Next.js App Router
```
frontend/src/app/
├── marketing/          # Marketing pages (for blytz.work)
│   ├── page.tsx        # Landing page
│   ├── about/page.tsx
│   ├── pricing/page.tsx
│   ├── faq/page.tsx
│   ├── terms/page.tsx
│   └── privacy/page.tsx
└── app/               # Application pages (for app.blytz.work)
    ├── auth/page.tsx
    ├── select-role/page.tsx
    ├── va/
    │   ├── onboarding/page.tsx
    │   ├── dashboard/page.tsx
    │   └── profiles/[id]/page.tsx
    ├── employer/
    │   ├── onboarding/page.tsx
    │   └── dashboard/page.tsx
    ├── chat/[id]/page.tsx
    └── contract/[id]/page.tsx
```

#### 1.2 Update Routing Logic
```typescript
// frontend/src/lib/domainDetector.ts
export const isMarketingDomain = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'blytz.work' || hostname === 'www.blytz.work';
};

export const isAppDomain = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'app.blytz.work';
};
```

### Phase 2: Marketing Site Deployment (Week 2)

#### 2.1 Static Marketing Site
```typescript
// frontend/marketing/next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isMarketingDomain() ? '' : '/marketing'
};
```

#### 2.2 Docker Configuration
```yaml
# docker-compose.marketing.yml
services:
  marketing-site:
    build:
      context: ./frontend
      dockerfile: Dockerfile.marketing
    environment:
      - NODE_ENV=production
      - SITE_TYPE=marketing
    labels:
      - "traefik.http.routers.marketing.rule=Host(`blytz.work`) || Host(`www.blytz.work`)"
      - "traefik.http.routers.marketing.tls.certresolver=letsencrypt"
      - "traefik.http.services.marketing.loadbalancer.server.port=3001"
```

### Phase 3: Application Site Migration (Week 3)

#### 3.1 App Configuration
```typescript
// frontend/app/next.config.js
module.exports = {
  output: 'standalone',
  images: {
    domains: ['app.blytz.work', 'api.blytz.work']
  },
  basePath: isAppDomain() ? '' : '/app',
  env: {
    NEXT_PUBLIC_APP_DOMAIN: 'app.blytz.work',
    NEXT_PUBLIC_API_DOMAIN: 'api.blytz.work'
  }
};
```

#### 3.2 Authentication Updates
```typescript
// frontend/app/src/lib/auth.ts
export const getAuthRedirectUrl = () => {
  if (isAppDomain()) {
    return `${window.location.origin}/auth`;
  } else {
    return 'https://app.blytz.work/auth';
  }
};

export const getRedirectUrl = (path: string) => {
  if (isAppDomain()) {
    return `${window.location.origin}${path}`;
  } else {
    return `https://app.blytz.work${path}`;
  }
};
```

### Phase 4: Backend Updates (Week 4)

#### 4.1 CORS Configuration
```typescript
// backend/src/server.ts
app.register(cors, {
  origin: [
    'https://blytz.work',
    'https://www.blytz.work', 
    'https://app.blytz.work',
    'https://staging.blytz.work',
    'https://staging-app.blytz.work'
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "DNT", "User-Agent", "X-Requested-With", "If-Modified-Since", "Cache-Control", "Range", "Accept", "Origin"],
  exposedHeaders: ["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
  preflightContinue: false,
  optionsSuccessStatus: 204
});
```

#### 4.2 Redirect Logic for Marketing Site
```typescript
// backend/src/routes/redirect.ts
app.get('/api/redirect-to-app', async (request, reply) => {
  const { path } = request.query as { path: string };
  return reply.redirect(301, `https://app.blytz.work${path || ''}`);
});
```

### Phase 5: DNS & SSL Setup (Week 5)

#### 5.1 DNS Records
```
# A Records
blytz.work         → MARKETING_SERVER_IP
www.blytz.work     → MARKETING_SERVER_IP
app.blytz.work      → APP_SERVER_IP

# CNAME Records  
api.blytz.work       → APP_SERVER_IP
staging.blytz.work   → STAGING_SERVER_IP
```

#### 5.2 SSL Certificate Configuration
```yaml
# Traefik configuration for multiple domains
services:
  traefik:
    command:
      - "--certificatesresolvers.letsencrypt.acme.email=admin@blytz.work"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--entrypoints.websecure.address=:443"
```

## SEO & Migration Considerations

### Search Engine Optimization
```html
<!-- Marketing site SEO focus -->
<head>
  <title>BlytzWork - Hire Virtual Assistants | Find Remote Work</title>
  <meta name="description" content="Connect with skilled virtual assistants for your business needs">
  <link rel="canonical" href="https://blytz.work">
</head>

<!-- App site minimal SEO -->
<head>
  <title>BlytzWork App - Dashboard</title>
  <meta name="robots" content="noindex, nofollow">
</head>
```

### Migration Safety Measures
- **Dual Serving**: Keep old paths working during transition
- **301 Redirects**: Permanent redirects for SEO juice preservation
- **Analytics Tracking**: Monitor traffic patterns during migration
- **Rollback Plan**: Ability to revert quickly if issues arise

## Deployment Strategy

### Blue-Green Deployment
1. **Deploy New Structure**: Both domains running side-by-side
2. **Test Thoroughly**: Full user journey testing
3. **DNS Cutover**: Gradual traffic routing
4. **Monitor**: Track errors and performance
5. **Cleanup**: Remove old structure after stable period

### Monitoring & Alerting
```typescript
// monitoring/migration-tracker.ts
export const trackMigrationMetrics = {
  marketingSiteVisits: () => increment('marketing.visits'),
  appSiteVisits: () => increment('app.visits'),
  authAttempts: () => increment('auth.attempts'),
  dashboardLoads: () => increment('dashboard.loads'),
  apiErrors: () => increment('api.errors'),
  redirectsOldToNew: () => increment('redirects.old_to_new')
};
```

## Testing Checklist

### Pre-Migration Testing
- [ ] All marketing pages load correctly
- [ ] Auth flow works on app subdomain
- [ ] Dashboard loads after onboarding completion
- [ ] Cross-domain API calls work
- [ ] SSL certificates valid for all domains
- [ ] Redirects work properly
- [ ] SEO meta tags correct for each site
- [ ] Analytics tracking works on both domains

### Post-Migration Validation
- [ ] User journey from marketing to app works
- [ ] Auth cookies scoped correctly to app.blytz.work
- [ ] API CORS properly configured
- [ ] Performance metrics within acceptable range
- [ ] Error rates remain low
- [ ] Search engines indexing correctly

## Risk Mitigation

### Potential Issues & Solutions
1. **Cookie Scoping**: Ensure auth cookies only work on app.blytz.work
2. **CORS Problems**: Test all API endpoints with both domains
3. **SEO Impact**: Implement proper 301 redirects
4. **User Confusion**: Clear CTAs directing users to correct domain
5. **DNS Propagation**: Use gradual DNS changes with TTL optimization

### Rollback Plan
- Keep original structure running in parallel
- Quick DNS switchback capability
- Database rollback scripts ready
- User communication templates prepared

This migration will improve both user experience and technical architecture while maintaining SEO and security best practices.