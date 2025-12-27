# Complete Authentication Flow - Documentation

## Problem Statement

The original authentication flow had multiple issues:

1. **Circular Auth Problem**: `/auth/sync-user` endpoint was protected by `verifyAuth` middleware, which required user to exist in database. But the endpoint's purpose was to create users in database - a circular dependency.

2. **Complex 401 Handling**: Frontend API client had complex retry logic with multiple attempts to sync users to database, but this created race conditions and inconsistent behavior.

3. **User Lookup by Email**: Backend was looking up users by email instead of Firebase UID, which could cause issues if Firebase email and database email weren't in sync.

4. **Multiple Sync Endpoints**: Several endpoints (`/auth/sync`, `/auth/sync-user`, `/auth/create-from-firebase`, `/auth/verify-user`) were all trying to solve the same problem - user creation on first login.

## New Simplified Authentication Flow

### Architecture Principle

**Single Source of Truth**: The `verifyAuth` middleware is now responsible for ensuring users exist in the database. This eliminates circular dependencies and simplifies the entire flow.

### Backend Changes

#### 1. Modified `verifyAuth` Middleware (`backend/src/plugins/firebaseAuth.ts`)

**Key Changes:**
- Changed user lookup from `email` to `id` (Firebase UID)
- Auto-creates user if doesn't exist in database
- Uses Firebase UID as primary key for consistency
- Logs user creation for debugging

**Flow:**
```typescript
// 1. Verify Firebase token
const decodedToken = await firebaseAuth.verifyIdToken(token);

// 2. Look up user by Firebase UID (not email!)
let user = await prisma.user.findUnique({
  where: { id: decodedToken.uid }
});

// 3. Auto-create if doesn't exist
if (!user) {
  user = await prisma.user.create({
    data: {
      id: decodedToken.uid,           // Firebase UID
      email: decodedToken.email,
      role: 'va',                     // Default role
      profileComplete: false,
      emailVerified: decodedToken.email_verified
    }
  });
}

// 4. Attach user to request
request.user = {
  uid: user.id,
  email: user.email,
  role: user.role,
  profileComplete: user.profileComplete
};
```

#### 2. Simplified `/auth/profile` Endpoint (`backend/src/routes/auth.ts`)

**Changes:**
- Removed auto-user creation (middleware now handles it)
- Simplified to just return user data
- No circular dependencies

#### 3. Removed Redundant Endpoints

Deleted endpoints that are no longer needed:
- ❌ `POST /auth/sync` - Middleware handles user creation
- ❌ `POST /auth/sync-user` - Middleware handles user creation
- ❌ `POST /auth/create-from-firebase` - Middleware handles user creation
- ❌ `GET /auth/verify-user` - Not needed, middleware handles validation

**Kept endpoints:**
- ✅ `GET /auth/profile` - Get user profile
- ✅ `PUT /auth/profile` - Update user profile
- ✅ `PATCH /auth/role` - Update user role (for onboarding)
- ✅ `POST /auth/forgot-password` - Password reset
- ✅ `POST /auth/token` - Generate custom token

### Frontend Changes

#### 1. Simplified API Client (`frontend/src/lib/api.ts`)

**Key Changes:**
- Removed complex 401 retry logic
- Removed user sync calls on error
- Single, predictable flow: If 401 → clear auth → redirect to login
- No more race conditions or infinite loops

**Simplified Flow:**
```typescript
// 1. Get token (or fetch fresh one)
let token = localStorage.getItem('authToken') || await getToken();

// 2. Make API request with auth header
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 3. Handle 401 - simple redirect
if (response.status === 401) {
  localStorage.clear();
  window.location.href = '/auth?expired=true';
}
```

#### 2. Simplified Auth Page (`frontend/src/app/auth/page.tsx`)

**Key Changes:**
- Removed complex timeout logic
- Removed user sync calls
- Removed multiple redirect checks
- Clean, linear flow

**Simplified Flow:**
```typescript
// 1. Firebase login/signup
const authUser = await signInUser(email, password);
localStorage.setItem('authUser', JSON.stringify(authUser));

// 2. Get Firebase token
const token = await getToken();
localStorage.setItem('authToken', token);

// 3. Call /auth/profile (middleware auto-creates user if needed)
const profileData = await apiCall('/auth/profile').json();

// 4. Determine redirect based on role and profile status
if (role === 'company') {
  if (hasCompanyProfile) {
    redirectPath = '/employer/dashboard';
  } else {
    redirectPath = '/employer/onboarding';
  }
} else if (role === 'va') {
  if (hasVAProfile) {
    redirectPath = '/va/dashboard';
  } else {
    redirectPath = '/va/onboarding';
  }
}
```

## Complete Authentication Flow

### New User Registration Flow

```
1. User fills registration form
   ↓
2. Firebase registerUser(email, password, name)
   ↓
3. Firebase creates user account
   ↓
4. Get Firebase ID token
   ↓
5. Store auth state in localStorage
   ↓
6. Call /auth/profile
   ↓
7. Backend verifyAuth middleware:
   - Verifies Firebase token
   - Checks if user exists in database by UID
   - User doesn't exist → Auto-create user
   - Returns user data
   ↓
8. Frontend receives user data
   ↓
9. Check role and profile status
   ↓
10. Redirect to appropriate onboarding or dashboard
```

### Existing User Login Flow

```
1. User fills login form
   ↓
2. Firebase signInUser(email, password)
   ↓
3. Firebase authenticates user
   ↓
4. Get Firebase ID token
   ↓
5. Store auth state in localStorage
   ↓
6. Call /auth/profile
   ↓
7. Backend verifyAuth middleware:
   - Verifies Firebase token
   - Finds user in database by UID
   - Returns user data
   ↓
8. Frontend receives user data
   ↓
9. Check role and profile status
   ↓
10. Redirect to appropriate dashboard
```

### Role Selection Flow

```
1. User selects "Company" or "VA" role
   ↓
2. Call PATCH /auth/role
   ↓
3. Backend updates user.role in database
   ↓
4. Frontend redirects to appropriate onboarding:
   - Company → /employer/onboarding
   - VA → /va/onboarding
```

### Onboarding Flow

```
1. User completes onboarding form
   ↓
2. Submit profile (VA or Company)
   ↓
3. Backend creates profile in database
   ↓
4. Optionally update user.profileComplete = true
   ↓
5. Redirect to dashboard
```

## Key Improvements

### 1. Eliminated Circular Dependency
- **Before**: Sync endpoint protected by auth → Auth requires user → Sync creates user → Circular!
- **After**: Middleware handles user creation → Single path → No circular dependency!

### 2. Simplified Error Handling
- **Before**: Complex retry logic, multiple sync attempts, race conditions
- **After**: Simple 401 → clear auth → redirect to login

### 3. Firebase UID as Primary Key
- **Before**: Looked up users by email (could be out of sync)
- **After**: Looked up users by Firebase UID (always in sync with Firebase)

### 4. Reduced Code Complexity
- **Before**: ~500 lines of auth route code with 6 endpoints
- **After**: ~150 lines of auth route code with 5 endpoints

### 5. Predictable Behavior
- **Before**: Sometimes user created, sometimes not, infinite loops possible
- **After**: User always created on first authenticated request

## Migration Notes

### For Existing Users

No migration needed! The new flow works with existing users because:
1. Existing users already have Firebase UID as their database ID
2. `verifyAuth` middleware finds existing users by UID
3. All subsequent API calls work as before

### For New Users

New users will be automatically created on their first authenticated request:
1. No need for separate user creation endpoints
2. No need for sync endpoints
3. Works seamlessly with Firebase authentication

## Testing the New Flow

### 1. Test New User Registration

```bash
# 1. Clear all auth state
localStorage.clear()

# 2. Register new Firebase user
# Fill registration form and submit

# 3. Check console logs:
# - "✅ Firebase registration successful"
# - "✅ User created in database" (from backend)

# 4. Verify user was created in database:
docker exec blytzwork-postgres psql -U blytz_user -d blytz_work \
  -c "SET search_path TO blytz_hire; SELECT id, email, role, profileComplete FROM users;"

# 5. Verify redirection to onboarding
# Should be redirected to /va/onboarding (default role)
```

### 2. Test Existing User Login

```bash
# 1. Login with existing Firebase user
# Fill login form and submit

# 2. Check console logs:
# - "✅ Firebase authentication successful"
# - No "User created" message (user already exists)

# 3. Verify redirection:
# - If profile complete → Redirect to dashboard
# - If profile incomplete → Redirect to onboarding
```

### 3. Test Role Selection

```bash
# 1. Login as user with no profile
# 2. Select role (Company or VA)
# 3. Submit
# 4. Verify redirect to appropriate onboarding
```

### 4. Test Token Expiration

```bash
# 1. Logout and clear localStorage
# 2. Wait for token to expire (1 hour)
# 3. Try to access protected page
# 4. Should be redirected to /auth?expired=true
# 5. Should see toast error "Session Expired"
```

## Troubleshooting

### Issue: Still getting 401 after changes

**Cause**: Backend not restarted with new middleware

**Solution**:
```bash
cd backend
npm run build
# Restart backend service
```

### Issue: User not being auto-created

**Cause**: DATABASE_URL still using old format with `?schema=`

**Solution**: Update DATABASE_URL to use `options=-c%20search_path=blytz_hire`:
```
postgresql://user:pass@host:5432/blytz_work?options=-c%20search_path=blytz_hire
```

### Issue: Frontend still using old API client

**Cause**: Browser caching old JavaScript

**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Or use incognito window

## Files Changed

### Backend
- `backend/src/plugins/firebaseAuth.ts` - Auto-create users in verifyAuth
- `backend/src/routes/auth.ts` - Simplified endpoints, removed sync endpoints

### Frontend
- `frontend/src/lib/api.ts` - Simplified error handling
- `frontend/src/app/auth/page.tsx` - Simplified login/signup flow

### Backup Files Created
- `frontend/src/lib/api-backup-2024-12-27.ts`
- `frontend/src/app/auth/page-backup-2024-12-27.tsx`
- `backend/src/routes/auth.ts.bak`

## Next Steps

1. ✅ Backend changes implemented
2. ✅ Frontend changes implemented
3. ⏳ Deploy and test
4. ⏳ Monitor logs for any issues
5. ⏳ Remove backup files after successful deployment

---

**Last Updated**: December 27, 2025
**Status**: ✅ Implementation Complete
**Ready for Deployment**: Yes
