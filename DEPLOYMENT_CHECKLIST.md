# Deployment & Migration Checklist

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

Ensure all apps have the correct environment variables:

#### Main App (.env.production)
```env
NEXTAUTH_SECRET=<same-secret-across-all-apps>
MONGODB_URI=<your-production-mongodb-uri>
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in
NEXT_PUBLIC_ADMIN_APP_URL=https://admin.aotf.in
NODE_ENV=production
```

#### Tutorials App (.env.production)
```env
NEXTAUTH_SECRET=<same-secret-across-all-apps>
NEXTAUTH_URL=https://tutorials.aotf.in
MONGODB_URI=<your-production-mongodb-uri>
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
NODE_ENV=production
```

#### Jobs App (.env.production)
```env
NEXTAUTH_SECRET=<same-secret-across-all-apps>
NEXTAUTH_URL=https://jobs.aotf.in
MONGODB_URI=<your-production-mongodb-uri>
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
NODE_ENV=production
```

### 2. Database Preparation

- [ ] Ensure MongoDB is accessible from all apps
- [ ] Verify user collection indexes are in place
- [ ] Check that `onboardingCompleted` field exists on all users
- [ ] Backup current database before deployment

### 3. DNS Configuration

Ensure subdomains are properly configured:
- [ ] `aotf.in` → Main app
- [ ] `tutorials.aotf.in` → Tutorials app
- [ ] `jobs.aotf.in` → Jobs app
- [ ] `admin.aotf.in` → Admin app
- [ ] All subdomains have valid SSL certificates

### 4. Build & Test

```bash
# From root directory
cd c:\Users\prita\Desktop\AOTF

# Install dependencies
pnpm install

# Build all apps
pnpm run build

# Test each app locally
# Main
cd apps/main
pnpm dev

# Tutorials
cd ../tutorials
pnpm dev

# Jobs
cd ../jobs
pnpm dev
```

## 📊 Migration Strategy

### Option A: Fresh Deployment (New System)

If this is a new deployment:
1. Deploy all apps simultaneously
2. Test signup → choose-path → login flow
3. Verify cookie isolation
4. Test onboarding on both platforms

### Option B: Migrating Existing Users

If you have existing users:

#### Step 1: Database Migration Script
```javascript
// scripts/migrate-auth-flow.js
const { MongoClient } = require('mongodb');

async function migrateUsers() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  
  // Ensure onboardingCompleted exists
  await db.collection('users').updateMany(
    { onboardingCompleted: { $exists: false } },
    { $set: { onboardingCompleted: true } } // Existing users = already onboarded
  );
  
  console.log('✅ Migration complete');
  await client.close();
}

migrateUsers().catch(console.error);
```

Run migration:
```bash
node scripts/migrate-auth-flow.js
```

#### Step 2: Communicate to Users

Send email to existing users:
```
Subject: Important: AOTF Platform Updates

We've improved our platform! You can now access:
- Tutorials: https://tutorials.aotf.in (Teachers & Guardians)
- Jobs: https://jobs.aotf.in (Freelancers & Clients)

Your credentials remain the same. Just log in at the appropriate platform.
```

## 🧪 Post-Deployment Testing

### Test Scenario 1: New User Signup
1. Visit `https://aotf.in`
2. Click "Sign Up"
3. Fill form: email, password, name
4. Submit
5. ✅ Verify redirect to `/choose-path?email=...`
6. Click "Continue to Tutorials"
7. ✅ Verify redirect to `tutorials.aotf.in/login?email=...`
8. Enter password
9. ✅ Verify session cookie `tutorials-auth-token` created
10. ✅ Verify redirect to `/onboarding`
11. Complete onboarding
12. ✅ Verify redirect to appropriate dashboard

### Test Scenario 2: Cookie Isolation
1. Log in to Tutorials app
2. Open DevTools → Application → Cookies
3. ✅ Verify `tutorials-auth-token` exists ONLY for `tutorials.aotf.in`
4. Visit `jobs.aotf.in`
5. ✅ Verify NO `tutorials-auth-token` cookie on jobs domain
6. ✅ Verify redirected to `/login` (not authenticated on jobs)

### Test Scenario 3: Onboarding Redirect
1. Create user with `onboardingCompleted: false`
2. Log in on Tutorials app
3. ✅ Verify redirect to `/onboarding`
4. Try accessing `/teacher` directly
5. ✅ Verify redirected back to `/onboarding`
6. Complete onboarding
7. ✅ Verify can now access `/teacher`

### Test Scenario 4: Main App Blocks Auth
1. Try visiting `aotf.in/onboarding`
2. ✅ Verify redirect to `/choose-path`
3. Try visiting `aotf.in/dashboard`
4. ✅ Verify redirect to `/choose-path`
5. Try POST to `aotf.in/api/auth/login`
6. ✅ Verify 410 response with message

## 🔍 Monitoring

### Key Metrics to Track

1. **Signup Completion Rate**
   - Users who complete signup on main app
   - Users who choose a platform on choose-path
   - Users who complete login on sub-app

2. **Session Errors**
   - Failed logins per app
   - Cookie-related errors
   - Redirect loops

3. **Onboarding Funnel**
   - Users starting onboarding
   - Users completing onboarding
   - Drop-off points

### Error Monitoring

Watch for these common issues:

```javascript
// In your error tracking (e.g., Sentry)
// Track these events:
{
  "signup_failed": "Signup API error",
  "login_failed_tutorials": "Login failed on Tutorials app",
  "login_failed_jobs": "Login failed on Jobs app",
  "cookie_not_set": "Session cookie not created",
  "onboarding_redirect_loop": "Infinite redirect in onboarding",
  "session_expired": "Session token expired"
}
```

## 🐛 Rollback Plan

If critical issues arise:

### Quick Rollback (Main App Only)
```bash
# Revert main app to allow direct login
# Edit apps/main/src/app/api/auth/[...nextauth]/route.ts
# Re-enable userAuthHandlers

# Redeploy main app only
cd apps/main
pnpm build
# Deploy to production
```

### Full Rollback
```bash
# Revert all changes
git revert <commit-hash>

# Or restore from backup
git checkout <previous-stable-branch>

# Rebuild and redeploy
pnpm build
```

## ✅ Success Criteria

Consider the deployment successful when:

- [ ] New users can signup on main app
- [ ] Users are redirected to choose-path after signup
- [ ] Email pre-fills on sub-app login pages
- [ ] Users can login on Tutorials app
- [ ] Users can login on Jobs app
- [ ] Sessions are isolated (no cross-app cookies)
- [ ] Onboarding redirects work correctly
- [ ] Dashboards load for onboarded users
- [ ] No infinite redirect loops
- [ ] Error rate < 1% for auth flows
- [ ] Main app properly blocks auth routes

## 📞 Support

If issues arise:

1. Check logs in each app
2. Verify environment variables
3. Check MongoDB connection
4. Review cookie settings in browser DevTools
5. Test with different browsers/devices
6. Check network tab for failed requests

## 📝 Post-Launch Tasks

- [ ] Monitor error rates for 48 hours
- [ ] Collect user feedback on new flow
- [ ] Update documentation with any edge cases discovered
- [ ] Optimize redirect performance
- [ ] Consider adding analytics tracking
- [ ] Plan email verification feature (future)
- [ ] Consider session transfer between apps (if needed)

---

**Date Prepared**: 2025-11-09  
**Prepared By**: AI Assistant  
**Review Status**: Ready for Production Deployment
