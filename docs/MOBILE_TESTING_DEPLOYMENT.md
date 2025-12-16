# 🧪 Hyred Mobile Testing & Deployment Guide

## 📋 Pre-Development Checklist

### Environment Setup
- [ ] React Native development environment configured
- [ ] iOS development: Xcode installed and configured
- [ ] Android development: Android Studio installed
- [ ] Firebase project created and configured
- [ ] Stripe account set up for mobile payments
- [ ] Physical test devices available (iOS and Android)

### Project Configuration
- [ ] Environment variables configured (.env files)
- [ ] Firebase configuration files added (GoogleService-Info.plist, google-services.json)
- [ ] App signing certificates created
- [ ] Provisioning profiles configured (iOS)
- [ ] Keystore created (Android)

---

## 🧪 Testing Strategy

### 1. Unit Testing

#### Test Coverage Requirements
```yaml
coverage_targets:
  statements: 80%
  branches: 75%
  functions: 85%
  lines: 80%

required_coverage:
  - services/*
  - utils/*
  - hooks/*
  - components/atoms/*
  - store/slices/*
```

#### Sample Unit Tests
```typescript
// __tests__/services/apiService.test.ts
describe('APIService', () => {
  describe('get', () => {
    it('should return data for successful requests', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiService.get('/test');
      
      expect(result).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/test', undefined);
    });

    it('should return cached data when offline', async () => {
      const cachedData = { id: 'cached', name: 'Cached' };
      mockAxios.get.mockRejectedValue({ code: 'NETWORK_ERROR' });
      mockOfflineService.getCachedGetRequest.mockResolvedValue(cachedData);

      const result = await apiService.get('/test');
      
      expect(result).toEqual(cachedData);
    });
  });
});
```

### 2. Integration Testing

#### API Integration Tests
```typescript
// __tests__/integration/auth.integration.test.ts
describe('Authentication Flow Integration', () => {
  it('should complete full login flow', async () => {
    // Mock Firebase
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: '123', email: 'test@example.com', getIdToken: jest.fn() }
    });

    // Mock backend sync
    mockApi.post.mockResolvedValue({ data: { success: true } });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/auth/sync', expect.any(Object));
    });
  });
});
```

#### Database Integration Tests
```typescript
// __tests__/integration/offline.integration.test.ts
describe('Offline Data Management', () => {
  it('should cache and retrieve profile data', async () => {
    const profileData = {
      id: 'profile1',
      name: 'John Doe',
      skills: ['React', 'TypeScript']
    };

    // Cache data
    await offlineService.cacheProfile('profile1', profileData);
    
    // Retrieve cached data
    const cached = await offlineService.getCachedProfile('profile1');
    
    expect(cached).toEqual(profileData);
  });

  it('should queue operations when offline', async () => {
    mockApi.post.mockRejectedValue({ code: 'NETWORK_ERROR' });

    const operation = {
      url: '/proposals',
      data: { jobId: '123', message: 'Test proposal' }
    };

    await apiService.post(operation.url, operation.data);
    
    const queue = await offlineService.getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].operation).toBe('POST');
  });
});
```

### 3. UI/UX Testing

#### Component Testing
```typescript
// __tests__/components/SwipeableCard.test.tsx
describe('SwipeableCard Component', () => {
  it('should render profile information correctly', () => {
    const profile = {
      id: '1',
      name: 'Jane Smith',
      title: 'Senior Developer',
      hourlyRate: 75,
      skills: ['React', 'Node.js']
    };

    const { getByText } = render(
      <SwipeableCard
        profile={profile}
        onSwipeLeft={jest.fn()}
        onSwipeRight={jest.fn()}
        onSwipeUp={jest.fn()}
        onTap={jest.fn()}
      />
    );

    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Senior Developer')).toBeTruthy();
    expect(getByText('$75/hour')).toBeTruthy();
  });

  it('should trigger callbacks on swipe gestures', () => {
    const onSwipeLeft = jest.fn();
    const { getByTestId } = render(
      <SwipeableCard
        profile={mockProfile}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={jest.fn()}
        onSwipeUp={jest.fn()}
        onTap={jest.fn()}
      />
    );

    const card = getByTestId('swipeable-card');
    
    // Simulate swipe gesture
    fireEvent(card, 'onGestureEvent', {
      nativeEvent: { translationX: -150 }
    });
    
    fireEvent(card, 'onHandlerStateChange', {
      nativeEvent: { state: State.END, translationX: -150 }
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });
});
```

#### Accessibility Testing
```typescript
// __tests__/accessibility/accessibility.test.tsx
describe('Accessibility Features', () => {
  it('should have proper accessibility labels', () => {
    const { getByLabelText } = render(<LoginScreen />);
    
    expect(getByLabelText('Email input field')).toBeTruthy();
    expect(getByLabelText('Password input field')).toBeTruthy();
    expect(getByLabelText('Sign in button')).toBeTruthy();
  });

  it('should support screen readers', () => {
    const { getByRole } = render(<JobCard job={mockJob} />);
    
    const card = getByRole('button');
    expect(card).toHaveProperty('accessibilityRole', 'button');
    expect(card).toHaveProperty('accessibilityLabel', 'Job: React Developer at Tech Corp');
  });
});
```

### 4. Device-Specific Testing

#### iOS Testing Checklist
```yaml
ios_testing:
  devices:
    - iPhone 14 Pro (iOS 16)
    - iPhone 13 (iOS 15)
    - iPhone SE (iOS 14)
    - iPad Pro (iPadOS 16)
  
  features_to_test:
    - Face ID authentication
    - Dynamic Island integration
    - Haptic feedback
    - iOS-specific gestures
    - App Tracking Transparency
    - Apple Pay integration
    - iCloud Keychain
    - Shortcuts app integration
```

#### Android Testing Checklist
```yaml
android_testing:
  devices:
    - Pixel 7 Pro (Android 13)
    - Samsung Galaxy S23 (Android 12)
    - OnePlus 11 (Android 12)
    - Xiaomi Redmi Note 11 (Android 11)
  
  features_to_test:
    - Fingerprint authentication
    - Material You theming
    - Back gesture handling
    - Picture-in-picture mode
    - App bundles and splits
    - Google Pay integration
    - Notification channels
    - Widget support
```

### 5. Performance Testing

#### Load Testing
```typescript
// __tests__/performance/load.test.ts
describe('Performance under load', () => {
  it('should handle rapid API calls', async () => {
    const promises = Array(50).fill(null).map((_, i) => 
      apiService.get(`/jobs?page=${i}`)
    );

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    expect(results).toHaveLength(50);
    expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
  });

  it('should handle large data sets efficiently', async () => {
    const largeDataset = Array(1000).fill(null).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    }));

    const startTime = Date.now();
    
    const { getByText } = render(
      <FlatList
        data={largeDataset}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item) => item.id.toString()}
      />
    );

    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1 second max
  });
});
```

#### Memory Testing
```typescript
// __tests__/performance/memory.test.ts
describe('Memory usage', () => {
  it('should not leak memory during navigation', async () => {
    const initialMemory = await DeviceInfo.getTotalMemory();
    
    const { getByText } = render(<App />);
    
    // Navigate through multiple screens
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByText('Next Screen'));
      await wait(100);
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = await DeviceInfo.getTotalMemory();
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max
  });
});
```

---

## 🔒 Security Testing

### Penetration Testing Checklist
```yaml
security_testing:
  authentication:
    - token_storage_security
    - biometric_bypass_attempts
    - session_hijacking_prevention
    - brute_force_protection
  
  data_protection:
    - encryption_at_rest
    - encryption_in_transit
    - secure_storage_verification
    - data_wiping_on_logout
  
  api_security:
    - certificate_pinning
    - request_signing
    - rate_limiting_compliance
    - injection_attack_prevention
  
  platform_specific:
    - root_jailbreak_detection
    - tamper_detection
    - reverse_engineering_prevention
    - debug_flag_detection
```

### Security Test Implementation
```typescript
// __tests__/security/security.test.ts
describe('Security Features', () => {
  it('should store tokens securely', async () => {
    const token = 'test-jwt-token';
    await authService.storeToken(token);
    
    // Verify token is stored in secure storage, not AsyncStorage
    const secureStorage = await Keychain.getInternetCredentials('hyred_token');
    expect(secureStorage.password).toBe(token);
    
    const asyncStorage = await AsyncStorage.getItem('auth_token');
    expect(asyncStorage).toBeNull();
  });

  it('should detect rooted/jailbroken devices', async () => {
    const isCompromised = await SecurityService.isDeviceCompromised();
    
    if (isCompromised) {
      expect(SecurityService.handleCompromisedDevice).toHaveBeenCalled();
    }
  });
});
```

---

## 📱 Device Testing Matrix

### Test Device Coverage
| Device | OS Version | Screen Size | Priority | Features to Test |
|--------|------------|-------------|----------|------------------|
| iPhone 14 Pro | iOS 16 | 6.1" | High | All features |
| iPhone 13 | iOS 15 | 6.1" | High | Core features |
| iPhone SE | iOS 14 | 4.7" | Medium | Layout adaptation |
| iPad Pro | iPadOS 16 | 12.9" | Low | Tablet optimization |
| Pixel 7 Pro | Android 13 | 6.7" | High | All features |
| Galaxy S23 | Android 12 | 6.1" | High | Core features |
| OnePlus 11 | Android 12 | 6.7" | Medium | Performance |
| Redmi Note 11 | Android 11 | 6.43" | Medium | Compatibility |

### Feature Testing Matrix
```yaml
test_matrix:
  authentication:
    devices: ['all']
    scenarios: ['email_login', 'google_login', 'biometric_login', 'logout']
    
  profile_management:
    devices: ['all']
    scenarios: ['view_profile', 'edit_profile', 'upload_photo', 'save_changes']
    
  job_discovery:
    devices: ['all']
    scenarios: ['browse_jobs', 'search_jobs', 'filter_jobs', 'save_job']
    
  swipe_interface:
    devices: ['iphone_14_pro', 'pixel_7_pro', 'galaxy_s23']
    scenarios: ['swipe_left', 'swipe_right', 'swipe_up', 'tap_card']
    
  offline_mode:
    devices: ['iphone_13', 'pixel_7_pro']
    scenarios: ['offline_browsing', 'sync_when_online', 'conflict_resolution']
```

---

## 🚀 Deployment Process

### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage meets requirements (80%+)
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility review passed
- [ ] App store assets prepared
- [ ] Release notes written
- [ ] Rollback plan prepared

### iOS App Store Deployment

#### 1. Build Configuration
```bash
# Update version numbers
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString 1.0.0" ios/HyredMobile/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 1" ios/HyredMobile/Info.plist

# Build for release
npx react-native run-ios --configuration Release --device "Generic iOS Device"

# Create archive
xcodebuild -workspace ios/HyredMobile.xcworkspace \
  -scheme HyredMobile \
  -configuration Release \
  -archivePath ios/build/HyredMobile.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath ios/build/HyredMobile.xcarchive \
  -exportPath ios/build/ \
  -exportOptionsPlist ios/exportOptions.plist
```

#### 2. App Store Connect
```yaml
app_store_requirements:
  app_info:
    name: "Hyred - Hire Virtual Assistants"
    subtitle: "Find top VAs in minutes"
    description: "Professional platform for hiring virtual assistants"
    keywords: "virtual assistant, hire, remote work, freelancers"
    category: "Business"
    
  assets:
    icon: "1024x1024_png"
    screenshots:
      iphone_6_7: "6.7_inch_screenshots"
      iphone_5_5: "5.5_inch_screenshots"
      ipad_pro: "12.9_inch_screenshots"
    
  compliance:
    content_rights: "owned"
    encryption: "uses_encryption_exemption"
    advertising: "no_ads"
    
  review:
    demo_account: "provided"
    notes: "App requires account creation"
    contact: "developer@hyred.com"
```

### Android Play Store Deployment

#### 1. Build Configuration
```bash
# Update version
./gradlew android:updateVersionCode
./gradlew android:updateVersionName -PversionName=1.0.0

# Generate release AAB
./gradlew bundleRelease

# Sign the bundle
jarsigner -keystore release.keystore \
  -storepass $KEYSTORE_PASSWORD \
  -keypass $KEY_PASSWORD \
  app-release.aab \
  release-key
```

#### 2. Play Console
```yaml
play_store_requirements:
  app_info:
    title: "Hyred - Hire Virtual Assistants"
    short_description: "Find and hire top virtual assistants"
    full_description: "Complete platform for VA hiring"
    category: "Business"
    
  assets:
    icon: "512x512_png"
    feature_graphic: "1024x500_png"
    screenshots:
      phone: "phone_screenshots"
      tablet: "tablet_screenshots"
      
  content_rating:
    questionnaire: "business_professional"
    rating: "Everyone"
    
  distribution:
    countries: "all"
    devices: "phones_tablets"
    
  pricing:
    type: "free"
    ads: "no"
    in_app_purchases: "no"
```

### Post-Deployment Monitoring

#### Performance Monitoring
```typescript
// src/services/monitoringService.ts
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';

export class MonitoringService {
  static traceScreenView(screenName: string): void {
    const trace = perf().startTrace(`screen_${screenName}`);
    
    // Trace until screen unmounts or user navigates away
    return () => {
      trace.stop();
    };
  }

  static logEvent(eventName: string, params?: Record<string, any>): void {
    analytics().logEvent(eventName, params);
  }

  static recordError(error: Error, context?: string): void {
    crashlytics().recordError(error, context);
  }

  static setUserId(userId: string): void {
    crashlytics().setUserId(userId);
    analytics().setUserId(userId);
  }
}
```

#### Key Metrics to Monitor
```yaml
monitoring_metrics:
  performance:
    - app_launch_time
    - screen_load_time
    - api_response_time
    - crash_free_sessions
    
  user_engagement:
    - daily_active_users
    - session_duration
    - feature_adoption_rate
    - retention_rate
    
  business:
    - profile_completion_rate
    - job_application_conversion
    - payment_success_rate
    - user_satisfaction_score
    
  technical:
    - offline_sync_success_rate
    - push_notification_delivery
    - api_error_rate
    - memory_usage
```

---

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks
- [ ] Monitor crash reports daily
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Security patch management
- [ ] User feedback review and response
- [ ] App store optimization updates

### Update Deployment Process
```yaml
update_process:
  minor_updates:
    frequency: 'bi_weekly'
    testing: 'automated_smoke_tests'
    approval: 'product_owner'
    
  major_updates:
    frequency: 'quarterly'
    testing: 'full_regression_suite'
    approval: 'stakeholder_review'
    beta_testing: '2_weeks_minimum'
    
  hotfixes:
    trigger: 'critical_issues'
    timeline: '24_hours_max'
    testing: 'targeted_fix_verification'
    approval: 'engineering_lead'
```

This comprehensive testing and deployment guide ensures the Hyred mobile app meets the highest quality standards and provides a smooth deployment process.