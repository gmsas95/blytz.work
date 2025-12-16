# 📱 Hyred Mobile Implementation Guide

## 🚀 Getting Started

### Prerequisites
```bash
# Development Environment
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
java --version  # >= 11 (Android)
xcode --version # >= 14 (iOS)

# React Native CLI
npm install -g react-native-cli
npm install -g @react-native-community/cli
```

### Project Setup
```bash
# Create new React Native project
npx react-native init HyredMobile --template react-native-template-typescript

# Navigate to project
cd HyredMobile

# Install core dependencies
npm install @reduxjs/toolkit react-redux
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-biometrics
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/messaging
npm install @stripe/stripe-react-native
npm install react-native-camera
npm install react-native-image-picker
npm install react-native-fs
npm install react-native-sqlite-storage
npm install axios
npm install react-native-config
```

---

## 🏗️ Project Structure

```
HyredMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── atoms/          # Button, Input, Text, etc.
│   │   ├── molecules/      # Card, FormField, etc.
│   │   ├── organisms/      # Header, JobCard, etc.
│   │   └── templates/      # Screen layouts
│   ├── screens/            # Feature screens
│   │   ├── auth/           # Login, Register, Onboarding
│   │   ├── profile/        # VA Profile, Company Profile
│   │   ├── jobs/           # Job Discovery, Search, Details
│   │   ├── contracts/      # Contract Management
│   │   ├── payments/       # Payment Screens
│   │   └── messaging/      # Chat Interface
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and business logic
│   ├── store/              # Redux store and slices
│   ├── utils/              # Helpers and constants
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript definitions
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
└── fastlane/               # Deployment automation
```

---

## 🔧 Core Implementation

### 1. Navigation Setup

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Discover" component={JobDiscoveryStack} />
    <Tab.Screen name="Contracts" component={ContractsStack} />
    <Tab.Screen name="Messages" component={MessagesStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);
```

### 2. Authentication with Biometrics

```typescript
// src/services/authService.ts
import auth from '@react-native-firebase/auth';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  private biometrics = new ReactNativeBiometrics();

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Enable biometric authentication
      await this.setupBiometrics(userCredential.user.uid);
      
      // Sync with backend
      await this.syncUserWithBackend(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      throw new Error(this.mapAuthError(error));
    }
  }

  private async setupBiometrics(userId: string): Promise<void> {
    const { available, biometryType } = await this.biometrics.isSensorAvailable();
    
    if (available && (biometryType === 'FaceID' || biometryType === 'TouchID')) {
      await this.biometrics.createKeys();
      await AsyncStorage.setItem('biometricsEnabled', 'true');
    }
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const { success } = await this.biometrics.simplePrompt({
        promptMessage: 'Authenticate to access Hyred',
      });
      
      return success;
    } catch (error) {
      return false;
    }
  }

  private async syncUserWithBackend(firebaseUser: User): Promise<void> {
    const token = await firebaseUser.getIdToken();
    
    await api.post('/auth/sync', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

### 3. Offline-First Data Layer

```typescript
// src/services/offlineService.ts
import SQLite from 'react-native-sqlite-storage';
import { setupListeners } from '@reduxjs/toolkit/query';

export class OfflineService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase({
      name: 'hyred.db',
      location: 'default',
    });
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    const tables = [
      `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_sync DATETIME,
        dirty BOOLEAN DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_sync DATETIME,
        saved BOOLEAN DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.executeSql(table);
    }
  }

  async cacheProfile(profileId: string, data: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO profiles (id, data, last_sync, dirty)
      VALUES (?, ?, datetime('now'), 0)
    `;
    
    await this.executeSql(query, [profileId, JSON.stringify(data)]);
  }

  async getCachedProfile(profileId: string): Promise<any | null> {
    const query = 'SELECT data FROM profiles WHERE id = ?';
    const results = await this.executeSql(query, [profileId]);
    
    if (results.rows.length > 0) {
      return JSON.parse(results.rows.item(0).data);
    }
    
    return null;
  }

  async queueOperation(operation: string, data: any): Promise<void> {
    const query = `
      INSERT INTO sync_queue (operation, data)
      VALUES (?, ?)
    `;
    
    await this.executeSql(query, [operation, JSON.stringify(data)]);
  }

  async processSyncQueue(): Promise<void> {
    const query = 'SELECT * FROM sync_queue ORDER BY timestamp';
    const results = await this.executeSql(query);
    
    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i);
      
      try {
        await this.syncOperation(item.operation, JSON.parse(item.data));
        await this.removeFromQueue(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
      }
    }
  }

  private executeSql(query: string, params: any[] = []): Promise<SQLite.ResultSet> {
    return new Promise((resolve, reject) => {
      this.db.executeSql(query, params, (result) => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    });
  }
}
```

### 4. Swipe-Based UI Component

```typescript
// src/components/organisms/SwipeableCard.tsx
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface SwipeableCardProps {
  profile: VAProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onTap: () => void;
}

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 30;

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
      
      // Scale down as card moves further
      const distance = Math.sqrt(translateX.value ** 2 + translateY.value ** 2);
      scale.value = Math.max(0.8, 1 - distance / 1000);
    },
    onEnd: (event) => {
      // Determine swipe direction and trigger action
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        if (translateX.value > 0) {
          // Right swipe - interested
          runOnJS(onSwipeRight)();
        } else {
          // Left swipe - pass
          runOnJS(onSwipeLeft)();
        }
        
        // Animate card off screen
        translateX.value = withSpring(translateX.value > 0 ? 500 : -500);
      } else if (translateY.value < -SWIPE_THRESHOLD) {
        // Up swipe - super like
        runOnJS(onSwipeUp)();
        translateY.value = withSpring(-500);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [-ROTATION_RANGE, 0, ROTATION_RANGE]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <VACardContent profile={profile} onTap={onTap} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
```

### 5. API Service Layer

```typescript
// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken } from './authService';
import { offlineService } from './offlineService';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL || 'https://api.hyred.com',
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          await this.handleUnauthorized();
        } else if (error.response?.status >= 500) {
          // Handle server errors
          this.showErrorMessage('Server error. Please try again later.');
        } else if (error.response?.status === 429) {
          // Handle rate limiting
          this.showErrorMessage('Too many requests. Please slow down.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get(url, config);
      
      // Cache successful responses for offline access
      await offlineService.cacheGetRequest(url, response.data);
      
      return response.data;
    } catch (error) {
      // Try to get cached data if offline
      const cachedData = await offlineService.getCachedGetRequest(url);
      if (cachedData) {
        return cachedData;
      }
      
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      // Queue POST requests for sync when offline
      if (this.isOfflineError(error)) {
        await offlineService.queueOperation('POST', { url, data, config });
        return { queued: true } as T;
      }
      
      throw error;
    }
  }

  async uploadFile(url: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        // Emit progress event for UI updates
        this.emitUploadProgress(progress);
      },
    });
  }

  private isOfflineError(error: any): boolean {
    return !error.response || error.code === 'NETWORK_ERROR';
  }

  private async handleUnauthorized(): Promise<void> {
    // Clear stored tokens
    await AsyncStorage.removeItem('authToken');
    
    // Navigate to login screen
    NavigationService.navigate('Login');
  }

  private showErrorMessage(message: string): void {
    // Use a toast notification or alert
    Alert.alert('Error', message);
  }

  private emitUploadProgress(progress: number): void {
    // Emit event for components to listen to
    eventEmitter.emit('uploadProgress', progress);
  }
}

export const apiService = new ApiService();
```

### 6. Push Notification Setup

```typescript
// src/services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

export class NotificationService {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await this.setupNotifications();
    }

    return enabled;
  }

  private async setupNotifications(): Promise<void> {
    // Get FCM token
    const token = await messaging().getToken();
    
    // Send token to backend
    await apiService.post('/notifications/register-token', { token });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      await this.displayNotification(remoteMessage);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      await this.displayNotification(remoteMessage);
    });

    // Handle notification opened
    messaging().onNotificationOpenedApp(remoteMessage => {
      this.handleNotificationTap(remoteMessage);
    });

    // Check for initial notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      this.handleNotificationTap(initialNotification);
    }
  }

  private async displayNotification(remoteMessage: any): Promise<void> {
    const { title, body, data } = remoteMessage.notification || {};

    // Create channel (Android)
    const channelId = await notifee.createChannel({
      id: 'hyred_default',
      name: 'Hyred Notifications',
      importance: AndroidImportance.HIGH,
    });

    // Display notification
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        color: '#4F46E5',
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    });
  }

  private handleNotificationTap(remoteMessage: any): void {
    const { data } = remoteMessage;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'job_match':
        NavigationService.navigate('JobDetails', { jobId: data.jobId });
        break;
      case 'proposal_response':
        NavigationService.navigate('ContractDetails', { contractId: data.contractId });
        break;
      case 'payment':
        NavigationService.navigate('PaymentDetails', { paymentId: data.paymentId });
        break;
      default:
        NavigationService.navigate('Home');
    }
  }
}
```

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// __tests__/services/authService.test.ts
import { AuthService } from '../../src/services/authService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('loginWithEmail', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      const result = await authService.loginWithEmail('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });

    it('should throw error for invalid credentials', async () => {
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        authService.loginWithEmail('test@example.com', 'wrong_password')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/jobDiscovery.test.ts
import { render, waitFor } from '@testing-library/react-native';
import { JobDiscoveryScreen } from '../../src/screens/jobs/JobDiscoveryScreen';

describe('Job Discovery Integration', () => {
  it('should load and display jobs', async () => {
    const mockJobs = [
      { id: '1', title: 'React Developer', company: 'Tech Corp', rate: 50 },
      { id: '2', title: 'Designer', company: 'Design Studio', rate: 40 },
    ];

    mockApi.get.mockResolvedValue({ data: mockJobs });

    const { getByText } = render(<JobDiscoveryScreen />);

    await waitFor(() => {
      expect(getByText('React Developer')).toBeTruthy();
      expect(getByText('Designer')).toBeTruthy();
    });
  });

  it('should handle search functionality', async () => {
    const { getByPlaceholderText, getByText } = render(<JobDiscoveryScreen />);
    
    const searchInput = getByPlaceholderText('Search jobs...');
    fireEvent.changeText(searchInput, 'React');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/jobs/search?q=React');
    });
  });
});
```

---

## 🚀 Deployment

### iOS Deployment
```bash
# Install dependencies
cd ios && pod install

# Build for release
react-native run-ios --configuration Release

# Archive for App Store
xcodebuild -workspace HyredMobile.xcworkspace \
  -scheme HyredMobile \
  -configuration Release \
  -archivePath HyredMobile.xcarchive archive

# Upload to App Store
xcodebuild -exportArchive \
  -archivePath HyredMobile.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist
```

### Android Deployment
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate release AAB (recommended)
./gradlew bundleRelease

# Upload to Play Store (using Fastlane)
fastlane android deploy
```

### Fastlane Configuration
```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )
    
    build_app(
      scheme: "HyredMobile",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      force: true,
      skip_metadata: false,
      skip_screenshots: false
    )
  end
end

platform :android do
  desc "Deploy to Play Store"
  lane :deploy do
    gradle(task: "bundleRelease")
    
    upload_to_play_store(
      track: 'production',
      release_status: 'draft'
    )
  end
end
```

This implementation guide provides the technical foundation for building the Hyred mobile app with all the core features and best practices.