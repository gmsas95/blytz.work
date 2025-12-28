# Quick Deployment & Testing Guide

## 🚀 Deployment Steps

### 1. Commit & Push Changes
```bash
# Backend
cd /home/sas/blytz.work/backend
git add .
git commit -m "feat: Production-ready user flow and onboarding

- Fix VA onboarding API endpoint
- Add employer role sync
- Auto-set role on profile creation
- Add role normalization middleware
- Implement profile completion scoring
- Add role management utilities
- Improve error handling and logging"
git push origin main

# Frontend
cd /home/sas/blytz.work/frontend
git add .
git commit -m "feat: Production-ready user flow and onboarding

- Fix VA onboarding API endpoint
- Add employer role sync
- Update middleware with role normalization
- Create role management utilities
- Implement profile completion scoring
- Improve error handling and logging"
git push origin main
```

### 2. Verify Production Build
```bash
# Backend
cd /home/sas/blytz.work/backend
npm run build
# Should complete with no errors

# Frontend
cd /home/sas/blytz.work/frontend
npm run build
# Should complete successfully with all routes listed
```

### 3. Monitor Deployment (Dokploy)
```bash
# Watch backend deployment
docker logs -f blytzwork-backend

# Watch frontend deployment
docker logs -f blytzwork-frontend

# Check database
docker logs -f blytzwork-postgres
```

### 4. Post-Deployment Health Checks
```bash
# Backend health
curl https://api.blytz.work/health
# Expected: 200 OK with "🗄️ Database status: Connected"

# Frontend health
curl https://blytz.work/
# Expected: 200 OK with BlytzWork homepage

# API availability
curl https://api.blytz.work/api/auth/profile
# Expected: 401 (requires auth, but endpoint exists)
```

## 🧪 Testing Checklist

### Test 1: VA User Flow (New User)
```
1. Navigate to https://blytz.work
2. Click "Get Started" or "Sign Up"
3. Sign up with new email (not used before)
4. Complete Firebase authentication
5. Select "I want to work" (VA role)
6. Complete VA onboarding (name, country, bio, skills, rate)
7. Submit profile
8. EXPECTED: Redirected to /va/dashboard
9. CHECK: Can access /va/dashboard without issues
10. CHECK: Profile completion score displayed (should be ~70-80%)
11. REFRESH page
12. EXPECTED: Stay on /va/dashboard (no redirect to auth)
13. CHECK: Browser console shows "✅ Auth verified, proceeding to protected route"
14. TRY: Access /employer/dashboard
15. EXPECTED: Redirected to /select-role (wrong role)
```

### Test 2: Employer User Flow (New User)
```
1. Navigate to https://blytz.work
2. Click "Get Started" or "Sign Up"
3. Sign up with new email (not used before)
4. Complete Firebase authentication
5. Select "I want to hire" (Employer role)
6. Complete employer onboarding (name, country, industry, description, website)
7. Submit profile
8. EXPECTED: Redirected to /employer/dashboard
9. CHECK: Can access /employer/dashboard without issues
10. CHECK: Profile completion score displayed (should be ~70-80%)
11. REFRESH page
12. EXPECTED: Stay on /employer/dashboard (no redirect to auth)
13. CHECK: Browser console shows "✅ Auth verified, proceeding to protected route"
14. TRY: Access /va/dashboard
15. EXPECTED: Redirected to /select-role (wrong role)
```

### Test 3: Role Permanence (Critical)
```
1. Sign up as VA with email: test-va@example.com
2. Complete VA onboarding
3. Sign out
4. Sign in again with test-va@example.com
5. EXPECTED: Redirected to /va/dashboard (no role selection)
6. CHECK: Cannot select "Employer" role (already has VA role)
7. TRY: Directly navigate to /select-role
8. EXPECTED: Either auto-redirected to dashboard or role locked

Repeat for Employer with email: test-employer@example.com
```

### Test 4: Edge Cases
```
Test 4.1: Expired Token
1. Sign in as VA
2. Wait for token to expire (1 hour)
3. Try to access /va/dashboard
4. EXPECTED: Auto-refresh token or redirect to auth with message

Test 4.2: Network Error
1. Disconnect from internet
2. Try to submit onboarding form
3. EXPECTED: User-friendly error message about network
4. Reconnect
5. Submit again
6. EXPECTED: Form submits successfully

Test 4.3: Concurrent Sessions
1. Sign in as VA in Chrome
2. Sign in as Employer in Firefox (same email)
3. EXPECTED: Second session rejected or forces sign out first

Test 4.4: Clearing Cookies
1. Sign in and complete onboarding
2. Clear cookies from browser
3. Refresh /va/dashboard
4. EXPECTED: Redirected to /auth (requires re-authentication)
```

### Test 5: Profile Completion Scoring
```
Test 5.1: VA Profile Scoring
1. Sign up as VA
2. Complete ONLY required fields (name, country, bio, skills, rate)
3. Submit profile
4. CHECK: Completion score shows ~70%
5. CHECK: Status is "Basic" (yellow)
6. Add optional field (email)
7. Refresh
8. CHECK: Completion score increased to ~73%
9. Add more optional fields until score reaches 90%+
10. CHECK: Status becomes "Excellent" (green)

Test 5.2: Company Profile Scoring
1. Sign up as Employer
2. Complete ONLY required fields (name, country, industry, bio)
3. Submit profile
4. CHECK: Completion score shows ~70%
5. CHECK: Status is "Basic" (yellow)
6. Add optional field (website)
7. Refresh
8. CHECK: Completion score increased to ~73%
9. Add more optional fields until score reaches 90%+
10. CHECK: Status becomes "Excellent" (green)
```

### Test 6: Production Error Handling
```
Test 6.1: API Errors
1. Sign in as VA
2. Try to create VA profile with invalid data
3. EXPECTED: Validation error message displayed
4. CHECK: No 500 errors shown to user
5. CHECK: Browser console shows helpful error logs

Test 6.2: Role-Based Access
1. Sign in as VA
2. Try accessing /employer/dashboard directly in URL
3. EXPECTED: Redirected to /select-role
4. CHECK: Error parameter in URL: ?error=invalid_role
5. CHECK: Current role parameter in URL: ?current_role=va

Test 6.3: Backend Logging
1. Complete onboarding as VA
2. SSH into production server
3. Check backend logs:
   docker logs blytzwork-backend
4. EXPECTED: See log "✅ User role auto-updated to VA"
5. EXPECTED: See log "User clXXX... created in database"
6. CHECK: No error logs related to role mismatches
```

## 📊 Validation Criteria

### Success Indicators
- ✅ No TypeScript compilation errors in production builds
- ✅ No 404 errors on API endpoints during onboarding
- ✅ No 403 errors on profile creation
- ✅ No infinite redirect loops
- ✅ Dashboard accessible immediately after onboarding
- ✅ Profile completion scores displayed correctly
- ✅ Role-based access control enforced
- ✅ Backend logs show role auto-updates
- ✅ Middleware logs show correct role checks

### Failure Indicators (What to Fix)
- ❌ 404 errors on /api/auth/role
- ❌ 403 errors on profile creation
- ❌ Redirect loops between /auth and /dashboard
- ❌ Cannot access dashboard after onboarding
- ❌ Profile completion score always 0% or 100%
- ❌ Wrong role users accessing other dashboards
- ❌ Backend logs showing role-related errors
- ❌ Console errors about missing functions

## 🔍 Troubleshooting

### Issue: "404 Not Found on /api/auth/role"
**Cause**: Backend not deployed with new code
**Fix**:
```bash
cd /home/sas/blytz.work/backend
git pull origin main
docker restart blytzwork-backend
```

### Issue: "403 Forbidden on profile creation"
**Cause**: User role not set before profile creation
**Fix**: Check backend logs, ensure auto-role-set code is deployed
**Workaround**: Manually set role via /select-role first

### Issue: "Infinite redirect loop"
**Cause**: Middleware role normalization not deployed
**Fix**:
```bash
cd /home/sas/blytz.work/frontend
git pull origin main
docker restart blytzwork-frontend
```

### Issue: "Dashboard not accessible after onboarding"
**Cause**: Role not synced to database
**Fix**: Ensure syncUserRole() is called before redirect
**Debug**: Check browser console for role sync errors

### Issue: "Profile completion always 0%"
**Cause**: Profile data not being calculated correctly
**Fix**: Check that profile data is being returned from API
**Debug**: Log profile object in dashboard component

## 📝 Testing Report Template

```markdown
## Test Report - [Date]

### Environment
- URL: https://blytz.work
- Browser: [Chrome/Firefox/Safari]
- Test Duration: [X minutes]

### Test Results

#### VA User Flow
- [ ] New VA signup successful
- [ ] Role selection works
- [ ] Onboarding form submits successfully
- [ ] Dashboard accessible after onboarding
- [ ] Profile completion score displayed
- [ ] Page refresh stays on dashboard
- [ ] Cannot access employer dashboard
- [ ] Role permanence enforced

#### Employer User Flow
- [ ] New employer signup successful
- [ ] Role selection works
- [ ] Onboarding form submits successfully
- [ ] Dashboard accessible after onboarding
- [ ] Profile completion score displayed
- [ ] Page refresh stays on dashboard
- [ ] Cannot access VA dashboard
- [ ] Role permanence enforced

#### Edge Cases
- [ ] Expired token handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Concurrent sessions handled correctly
- [ ] Cookie clearing forces re-auth

#### Profile Scoring
- [ ] VA basic onboarding: ~70% completion
- [ ] VA full profile: 100% completion
- [ ] Company basic onboarding: ~70% completion
- [ ] Company full profile: 100% completion
- [ ] Status labels correct (Basic/Good/Excellent)
- [ ] Status colors correct (yellow/blue/green)

### Issues Found
1. [Describe issue]
   - Severity: [Critical/Major/Minor]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:

### Overall Status
- [ ] All critical tests passing
- [ ] All major tests passing
- [ ] Ready for production launch

### Notes
[Additional notes about testing]
```

## ✅ Final Verification

After completing all tests and fixing any issues:

### Production Readiness Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] Backend logs clean
- [ ] Frontend logs clean
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] SSL certificates valid
- [ ] Database migrations applied

### Go-Live Decision
- [ ] Approval from QA team
- [ ] Approval from product team
- [ ] Backup taken before deployment
- [ ] Rollback plan prepared
- [ ] Monitoring configured
- [ ] Support team notified
- [ ] Documentation updated

**Ready for Production Launch: [YES / NO]**

---

*Quick Deployment & Testing Guide v1.0.0*
*Last Updated: December 28, 2025*
