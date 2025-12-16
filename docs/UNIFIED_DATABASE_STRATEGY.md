# 🗄️ Unified Database Strategy for Hyred Platform

## 🎯 Executive Summary

This document outlines the database architecture for supporting both web and mobile applications with a **single, unified backend** that serves both platforms. The key is **one database, multiple clients** - not separate databases or repos.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │ Mobile App      │    │  Admin Panel    │
│   (Next.js)     │    │ (React Native)  │    │  (Optional)     │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   API Gateway         │
                    │   (Fastify Backend)   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   PostgreSQL DB       │
                    │   (Single Database)   │
                    └───────────────────────┘
```

## 💡 Key Principles

### 1. **Single Source of Truth**
- One PostgreSQL database serves all platforms
- All business logic centralized in the Fastify backend
- No platform-specific data silos

### 2. **Platform-Agnostic API**
- RESTful endpoints work identically for web and mobile
- JWT-based authentication for both platforms
- Consistent request/response formats

### 3. **Progressive Enhancement**
- Mobile gets enhanced features (push notifications, offline sync)
- Web gets enhanced features (real-time updates, larger screen layouts)
- Core functionality identical across platforms

---

## 🔄 Database Changes Needed

### Current Schema Enhancements

```sql
-- Add platform tracking for analytics
ALTER TABLE users ADD COLUMN last_platform VARCHAR(20);
ALTER TABLE users ADD COLUMN device_tokens JSONB DEFAULT '[]';

-- Add mobile-specific preferences
ALTER TABLE users ADD COLUMN mobile_preferences JSONB DEFAULT '{}';

-- Add push notification tracking
CREATE TABLE push_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  platform VARCHAR(20) NOT NULL, -- 'ios' or 'android'
  notification_type VARCHAR(50),
  title TEXT,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  clicked_at TIMESTAMP
);

-- Add mobile session tracking
CREATE TABLE mobile_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  device_id TEXT UNIQUE,
  platform VARCHAR(20),
  app_version VARCHAR(20),
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Mobile-Specific Considerations

```yaml
# Database Schema Extensions
mobile_enhancements:
  user_profiles:
    - device_tokens: "For push notifications"
    - mobile_preferences: "App settings, theme, etc."
    - last_platform: "Track web vs mobile usage"
    
  notifications:
    - push_notifications_table: "Track mobile notifications"
    - notification_preferences: "User opt-in settings"
    
  sessions:
    - mobile_sessions_table: "Track app usage analytics"
    - device_fingerprinting: "Security and analytics"
    
  content_optimization:
    - image_variants: "Multiple sizes for mobile/web"
    - offline_cache_metadata: "What to cache on mobile"
```

---

## 📱 Mobile-Specific API Enhancements

### New Endpoints for Mobile

```typescript
// Mobile Authentication
POST /api/mobile/auth/register-device
{
  deviceId: string;
  platform: 'ios' | 'android';
  pushToken: string;
  appVersion: string;
}

// Push Notification Management
POST /api/mobile/notifications/push-token
{
  pushToken: string;
  platform: 'ios' | 'android';
}

GET /api/mobile/notifications/preferences
PUT /api/mobile/notifications/preferences
{
  jobMatches: boolean;
  proposalUpdates: boolean;
  paymentAlerts: boolean;
  marketing: boolean;
}

// Offline Sync
GET /api/mobile/sync/initial-data
{
  // Returns essential data for offline caching
  profiles: VAProfile[];
  savedJobs: Job[];
  recentMessages: Message[];
  userPreferences: Preferences;
}

POST /api/mobile/sync/offline-operations
{
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    entity: string;
    data: any;
    timestamp: string;
  }>;
}

// Mobile Analytics
POST /api/mobile/analytics/events
{
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
}
```

### Enhanced Existing Endpoints

```typescript
// Add platform parameter to existing endpoints
GET /api/jobs/marketplace?platform=mobile&limit=20
// Returns mobile-optimized data (smaller images, condensed info)

GET /api/va/profiles/:id?platform=mobile
// Returns mobile-optimized profile data

POST /api/payments/create-intent
{
  // Existing payment data
  platform: 'mobile'; // New field
  deviceFingerprint: string; // For fraud prevention
}
```

---

## 🔄 Synchronization Strategy

### Real-time Sync (Web + Mobile)
```typescript
// WebSocket implementation for real-time updates
class SyncService {
  private webSocket: WebSocket;
  
  // Broadcast changes to all connected devices
  async broadcastUpdate(entity: string, data: any, userId: string) {
    const message = {
      type: 'entity_update',
      entity,
      data,
      timestamp: new Date().toISOString(),
      userId
    };
    
    // Send to all user's connected devices
    this.webSocket.send(JSON.stringify(message));
  }
  
  // Handle mobile-specific sync needs
  async handleMobileSync(userId: string, deviceId: string) {
    const syncData = {
      unreadNotifications: await this.getUnreadNotifications(userId),
      updatedJobs: await this.getUpdatedJobsSince(userId, lastSyncTime),
      newMessages: await this.getNewMessages(userId, lastSyncTime),
      profileUpdates: await this.getProfileUpdates(userId, lastSyncTime)
    };
    
    return syncData;
  }
}
```

### Offline-first Mobile Strategy
```typescript
// Mobile offline sync implementation
class MobileSyncService {
  async syncWhenOnline() {
    const offlineOperations = await offlineDB.getPendingOperations();
    
    for (const operation of offlineOperations) {
      try {
        await this.syncOperation(operation);
        await offlineDB.markOperationSynced(operation.id);
      } catch (error) {
        await this.handleSyncError(operation, error);
      }
    }
  }
  
  private async syncOperation(operation: OfflineOperation) {
    switch (operation.type) {
      case 'CREATE_PROPOSAL':
        return api.post('/proposals', operation.data);
      case 'UPDATE_PROFILE':
        return api.put('/profile', operation.data);
      case 'SAVE_JOB':
        return api.post('/saved-jobs', operation.data);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}
```

---

## 📊 Data Consistency Strategies

### 1. Optimistic Locking
```sql
-- Add version columns for conflict resolution
ALTER TABLE proposals ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN version INTEGER DEFAULT 1;
```

### 2. Last-Write-Wins with Timestamps
```typescript
// Conflict resolution strategy
function resolveConflict(serverData: any, clientData: any) {
  const serverTime = new Date(serverData.updatedAt).getTime();
  const clientTime = new Date(clientData.updatedAt).getTime();
  
  // More recent timestamp wins
  if (clientTime > serverTime) {
    return clientData;
  } else {
    return serverData;
  }
}
```

### 3. Merge Strategies
```typescript
// Intelligent merging for different data types
function mergeProfileUpdates(serverProfile: Profile, clientProfile: Profile) {
  return {
    // Basic info: last write wins
    name: clientProfile.updatedAt > serverProfile.updatedAt ? clientProfile.name : serverProfile.name,
    bio: clientProfile.updatedAt > serverProfile.updatedAt ? clientProfile.bio : serverProfile.bio,
    
    // Arrays: merge and deduplicate
    skills: [...new Set([...serverProfile.skills, ...clientProfile.skills])],
    
    // Counters: server wins (more authoritative)
    profileViews: serverProfile.profileViews,
    totalEarnings: serverProfile.totalEarnings,
    
    // Timestamps: keep both
    createdAt: serverProfile.createdAt,
    updatedAt: new Date().toISOString()
  };
}
```

---

## 🔒 Security Considerations

### Mobile-Specific Security
```typescript
// Device fingerprinting for mobile security
function generateDeviceFingerprint() {
  const deviceInfo = {
    platform: Platform.OS,
    version: DeviceInfo.getSystemVersion(),
    model: DeviceInfo.getModel(),
    uniqueId: DeviceInfo.getUniqueId(),
    timestamp: Date.now()
  };
  
  return crypto.createHash('sha256').update(JSON.stringify(deviceInfo)).digest('hex');
}

// Certificate pinning for mobile
const certificatePinning = {
  ios: ['sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='],
  android: ['sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=']
};
```

### API Rate Limiting per Platform
```typescript
// Different rate limits for web vs mobile
const rateLimits = {
  web: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },
  mobile: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200 // higher limit for mobile (more API calls due to sync)
  }
};
```

---

## 📈 Analytics & Monitoring

### Platform-Specific Analytics
```typescript
// Track platform usage for business insights
const analyticsEvents = {
  user_login: {
    platform: 'web' | 'mobile',
    device_type: 'desktop' | 'mobile' | 'tablet',
    app_version: string,
    timestamp: string
  },
  
  feature_usage: {
    feature: string,
    platform: 'web' | 'mobile',
    duration: number,
    completion_rate: number
  }
};
```

### Performance Monitoring
```yaml
monitoring_metrics:
  web_vs_mobile:
    - response_time_comparison
    - error_rate_comparison
    - user_engagement_comparison
    - conversion_rate_comparison
    
  mobile_specific:
    - app_crash_rate
    - offline_sync_success_rate
    - push_notification_delivery_rate
    - battery_usage_impact
```

---

## 🚀 Implementation Plan

### Phase 1: Backend Preparation (Week 1-2)
- [ ] Add mobile-specific database columns
- [ ] Create push notification infrastructure
- [ ] Implement device registration endpoints
- [ ] Add platform tracking to analytics
- [ ] Set up mobile-specific rate limiting

### Phase 2: API Enhancement (Week 3-4)
- [ ] Create mobile sync endpoints
- [ ] Implement offline operation queuing
- [ ] Add mobile-optimized data endpoints
- [ ] Enhance authentication for mobile
- [ ] Implement real-time sync via WebSocket

### Phase 3: Mobile App Development (Week 5-20)
- [ ] Build React Native app structure
- [ ] Implement offline-first architecture
- [ ] Create mobile UI components
- [ ] Integrate push notifications
- [ ] Add biometric authentication
- [ ] Implement sync mechanisms

### Phase 4: Testing & Optimization (Week 21-24)
- [ ] Cross-platform data consistency testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Deployment and monitoring

---

## 📋 Data Migration Checklist

### For Existing Users
```yaml
migration_tasks:
  existing_data:
    - "No migration needed - same database"
    - "Users can immediately use mobile app"
    - "Web sessions remain valid"
    
  new_features:
    - "Push notification opt-in"
    - "Mobile app download"
    - "Biometric authentication setup"
    - "Device registration"
```

### Backward Compatibility
```typescript
// Ensure existing web API continues to work
function maintainBackwardCompatibility(endpoint: string, platform?: string) {
  if (!platform) {
    // Default to web behavior for existing endpoints
    return getWebResponse(endpoint);
  }
  
  // Enhanced response for mobile
  return getMobileEnhancedResponse(endpoint);
}
```

---

## ✅ Benefits of This Approach

### 1. **Data Consistency**
- Single source of truth
- Real-time synchronization
- No data conflicts between platforms

### 2. **Cost Efficiency**
- No separate database infrastructure
- Shared business logic
- Unified maintenance

### 3. **User Experience**
- Seamless cross-platform experience
- Real-time updates across devices
- Consistent data everywhere

### 4. **Development Speed**
- Reuse existing backend
- Focus on frontend development
- Faster time to market

---

## 🎯 Conclusion

The unified database strategy ensures that both web and mobile platforms share the same data while allowing for platform-specific optimizations. The existing PostgreSQL database and Fastify backend will serve both platforms, with mobile-specific enhancements added as needed.

**Key Takeaway**: You'll have **one database, one backend API, multiple clients** (web + mobile). This approach maximizes code reuse while providing excellent user experience across all platforms.