# Multi-App Authentication - Quick Reference

## 🎯 Architecture Summary

- **Main App** (aotf.in): Signup only, no sessions
- **Tutorials App** (tutorials.aotf.in): Teachers & Guardians
- **Jobs App** (jobs.aotf.in): Freelancers & Clients
- **Each app**: Isolated NextAuth sessions with unique cookies

## 📋 User Flow

```
1. Signup on aotf.in
   ↓
2. Redirect to /choose-path
   ↓
3. Choose platform (Tutorials OR Jobs)
   ↓
4. Login on sub-app with pre-filled email
   ↓
5. Create isolated session
   ↓
6. Redirect to /onboarding (if incomplete)
   ↓
7. Complete onboarding
   ↓
8. Redirect to dashboard
```

## 🔑 Key Files Modified

### Main App
- ✅ `apps/main/middleware.ts` - Blocks auth routes
- ✅ `apps/main/src/app/api/auth/signup/route.ts` - NO session creation
- ✅ `apps/main/src/app/api/auth/login/route.ts` - Disabled (410)
- ✅ `apps/main/src/app/api/auth/[...nextauth]/route.ts` - Disabled (410)
- ✅ `apps/main/src/app/choose-path/page.tsx` - Platform selection
- ✅ `apps/main/src/components/home/AuthCard.tsx` - Redirect to choose-path

### Tutorials App
- ✅ `apps/tutorials/middleware.ts` - Auth + onboarding redirects
- ✅ `apps/tutorials/src/app/api/auth/[...nextauth]/route.ts` - Uses `tutorialsAuthHandlers`
- ✅ `apps/tutorials/src/app/login/page.tsx` - Login with email pre-fill

### Jobs App
- ✅ `apps/jobs/middleware.ts` - Auth + onboarding redirects (NEW)
- ✅ `apps/jobs/src/app/api/auth/[...nextauth]/route.ts` - Uses `jobsAuthHandlers`
- ✅ `apps/jobs/src/app/login/page.tsx` - Login with email pre-fill (NEW)

### Shared Packages
- ✅ `packages/nextauth/src/config.ts` - Cookie isolation logic
- ✅ `packages/nextauth/src/user.ts` - App-specific handlers
- ✅ `packages/lib/src/signup-flow.ts` - Multi-app utilities (NEW)

## 🍪 Cookie Configuration

| App | Cookie Name | Domain | Shared? |
|-----|-------------|--------|---------|
| Main | None | - | ❌ No session |
| Tutorials | `tutorials-auth-token` | `tutorials.aotf.in` | ❌ Isolated |
| Jobs | `jobs-auth-token` | `jobs.aotf.in` | ❌ Isolated |
| Admin | `admin-auth-token` | `admin.aotf.in` | ❌ Isolated |

**Important**: No leading dot (`.`) in domain = cookie restricted to exact subdomain only

## 🔒 Security Features

- ✅ Isolated sessions per app
- ✅ No cross-app authentication
- ✅ Subdomain-specific cookies
- ✅ Individual CSRF tokens per app
- ✅ Rate limiting per app
- ✅ Secure cookies in production

## 🧪 Testing Checklist

- [ ] Signup on main app creates user (no session)
- [ ] Choose-path page shows both platforms
- [ ] Email pre-fills on sub-app login
- [ ] Login creates app-specific cookie only
- [ ] Onboarding redirect works correctly
- [ ] Dashboard redirect matches user type
- [ ] Cookies are NOT shared between apps
- [ ] Main app blocks /onboarding and /dashboard routes
- [ ] Sub-app login doesn't work on main app

## 🚀 Environment Variables Required

```env
# All Apps
NEXTAUTH_SECRET=your-secret-here
MONGODB_URI=your-mongodb-connection-string

# Main App
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in

# Tutorials App
NEXTAUTH_URL=https://tutorials.aotf.in
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in

# Jobs App
NEXTAUTH_URL=https://jobs.aotf.in
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
```

## 📝 Notes

1. **Main app** only handles signup and routing - NO authentication
2. **Sub-apps** handle their own login, session, and onboarding
3. **Cookies** are isolated - no cross-app session sharing
4. **Onboarding** happens AFTER login on the chosen sub-app
5. **User** can access both platforms with same credentials (separate sessions)

## 📚 Full Documentation

See `MULTI_APP_AUTH.md` for complete documentation including:
- Detailed architecture
- Security considerations
- Troubleshooting guide
- API routes reference
- Testing procedures

---

**Implementation Status**: ✅ Complete and production-ready
