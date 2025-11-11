# Multi-App Authentication Flow

This document describes the authentication and session management architecture for the AOTF platform.

## Overview

AOTF uses a **multi-app architecture** with separate Next.js applications for different user types:

- **main** (aotf.in) - Marketing site and signup only
- **tutorials** (tutorials.aotf.in) - For teachers and guardians
- **jobs** (jobs.aotf.in) - For freelancers and clients
- **admin** (admin.aotf.in) - For platform administrators

## Key Design Decisions

### 1. **No Cross-App Session Sharing**

Each sub-app (tutorials, jobs, admin) maintains its own isolated NextAuth session:
- Separate cookie names: `tutorials-auth-token`, `jobs-auth-token`, `admin-auth-token`
- Subdomain-specific cookie domains (no leading dot)
- No shared authentication state between apps

### 2. **Main App: Signup Only**

The main app (aotf.in) handles:
- ✅ User registration (creates user in MongoDB)
- ✅ Routing to appropriate sub-app
- ❌ No login functionality
- ❌ No NextAuth session creation
- ❌ No onboarding flow

### 3. **Sub-Apps: Login and Onboarding**

Each sub-app handles:
- ✅ Login with NextAuth
- ✅ Session management (isolated cookies)
- ✅ Onboarding flow
- ✅ User-type-specific dashboards

## User Flow

### Signup Flow

1. User visits **aotf.in** and clicks "Sign Up"
2. User enters email, password, and name
3. POST `/api/auth/signup` creates user in MongoDB (no session)
4. User is redirected to **aotf.in/choose-path?email={email}**
5. User chooses platform:
   - "Continue to Tutorials" → `tutorials.aotf.in/login?email={email}`
   - "Continue to Jobs" → `jobs.aotf.in/login?email={email}`

### Login Flow (Tutorials App Example)

1. User visits **tutorials.aotf.in/login**
2. Email is pre-filled from signup flow (optional)
3. User enters password
4. NextAuth creates session with `tutorials-auth-token` cookie
5. Middleware checks onboarding status:
   - If `onboardingCompleted === false` → redirect to `/onboarding`
   - If `onboardingCompleted === true` → redirect to appropriate dashboard

### Onboarding Flow

1. User completes onboarding on the sub-app (tutorials or jobs)
2. Onboarding sets `user.onboardingCompleted = true` in MongoDB
3. User is redirected to their dashboard based on `userType`:
   - Teachers → `/teacher`
   - Guardians → `/feed`
   - Freelancers → `/freelancer/dashboard`
   - Clients → `/client/dashboard`

## File Structure

### Main App (aotf.in)

```
apps/main/
├── src/app/
│   ├── api/auth/
│   │   ├── signup/route.ts          ✅ Creates user, NO session
│   │   ├── login/route.ts           ❌ Disabled (returns 410)
│   │   └── [...nextauth]/route.ts   ❌ Disabled (returns 410)
│   ├── choose-path/page.tsx         ✅ Platform selection UI
│   └── page.tsx                     ✅ Home with signup form
└── middleware.ts                     ✅ Blocks /onboarding, /dashboard, etc.
```

### Tutorials App (tutorials.aotf.in)

```
apps/tutorials/
├── src/app/
│   ├── api/auth/
│   │   └── [...nextauth]/route.ts   ✅ Uses tutorialsAuthHandlers
│   ├── login/page.tsx               ✅ Login with email pre-fill
│   ├── onboarding/                  ✅ Onboarding flow
│   ├── teacher/                     ✅ Teacher dashboard
│   └── feed/                        ✅ Guardian feed
└── middleware.ts                     ✅ Auth + onboarding redirects
```

### Jobs App (jobs.aotf.in)

```
apps/jobs/
├── src/app/
│   ├── api/auth/
│   │   └── [...nextauth]/route.ts   ✅ Uses jobsAuthHandlers
│   ├── login/page.tsx               ✅ Login with email pre-fill
│   ├── onboarding/                  ✅ Onboarding flow
│   ├── client/                      ✅ Client dashboard
│   └── freelancer/                  ✅ Freelancer dashboard
└── middleware.ts                     ✅ Auth + onboarding redirects
```

### Shared Packages

```
packages/nextauth/
├── src/
│   ├── config.ts                    ✅ Creates isolated auth configs
│   └── user.ts                      ✅ Exports app-specific handlers

packages/lib/
└── src/
    └── signup-flow.ts               ✅ Utilities for multi-app flow
```

## NextAuth Configuration

### Cookie Isolation

Each app uses a unique cookie name and domain:

```typescript
// Tutorials App
{
  cookie: {
    name: "tutorials-auth-token",
    domain: "tutorials.aotf.in"  // NO leading dot
  }
}

// Jobs App
{
  cookie: {
    name: "jobs-auth-token",
    domain: "jobs.aotf.in"  // NO leading dot
}
```

**Why no leading dot?**
- `.aotf.in` = cookie shared across ALL subdomains ❌
- `tutorials.aotf.in` = cookie ONLY for tutorials subdomain ✅

### Environment Variables

Each app needs:

```env
# Main App (.env)
NEXT_PUBLIC_MAIN_APP_URL=https://aotf.in
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in

# Tutorials App (.env)
NEXT_PUBLIC_TUTORIALS_APP_URL=https://tutorials.aotf.in
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://tutorials.aotf.in

# Jobs App (.env)
NEXT_PUBLIC_JOBS_APP_URL=https://jobs.aotf.in
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://jobs.aotf.in
```

## Middleware Logic

### Main App Middleware

```typescript
// Block auth-protected routes
if (isProtectedRoute) {
  // Redirect to appropriate sub-app login
  return NextResponse.redirect('/choose-path');
}

// Block onboarding (happens on sub-apps)
if (pathname.startsWith('/onboarding')) {
  return NextResponse.redirect('/choose-path');
}
```

### Sub-App Middleware (Tutorials/Jobs)

```typescript
// Check authentication
const token = getAuthTokenFromCookies(cookies, ['app-specific-token']);
if (!token) {
  return NextResponse.redirect('/login');
}

// Check onboarding status
const payload = decodeToken(token);
if (!payload.onboardingCompleted && !isOnboardingRoute) {
  return NextResponse.redirect('/onboarding');
}

if (payload.onboardingCompleted && isOnboardingRoute) {
  return NextResponse.redirect(getDashboardForUserType(payload.userType));
}
```

## API Routes

### Main App

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/auth/signup` | ✅ Active | Creates user in MongoDB |
| `POST /api/auth/login` | ❌ 410 Gone | Disabled, use sub-apps |
| `* /api/auth/[...nextauth]` | ❌ 410 Gone | Disabled, use sub-apps |

### Tutorials App

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `* /api/auth/[...nextauth]` | ✅ Active | NextAuth with `tutorials-auth-token` |
| Other tutorial APIs | ✅ Active | Teacher/guardian specific |

### Jobs App

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `* /api/auth/[...nextauth]` | ✅ Active | NextAuth with `jobs-auth-token` |
| Other job APIs | ✅ Active | Freelancer/client specific |

## Security Considerations

### Session Isolation
- Each app has its own session token
- Cookies are domain-restricted
- No cross-app authentication leaks

### CSRF Protection
- Each app has its own CSRF token
- Token name: `{cookie-name}.csrf-token`

### Rate Limiting
- Applied per-app
- In-memory (upgrade to Redis for production)

## Testing

### Manual Testing Flow

1. **Signup on Main App**
   ```
   Visit: https://aotf.in
   Click: Sign Up
   Enter: email, password, name
   Submit: Creates user in MongoDB
   Verify: Redirected to /choose-path?email={email}
   ```

2. **Choose Platform**
   ```
   Click: "Continue to Tutorials" OR "Continue to Jobs"
   Verify: Redirected to sub-app login with email pre-filled
   ```

3. **Login on Sub-App**
   ```
   Visit: https://tutorials.aotf.in/login?email={email}
   Enter: password
   Submit: Creates session with app-specific cookie
   Verify: Redirected to /onboarding (if not completed)
   ```

4. **Complete Onboarding**
   ```
   Complete onboarding flow
   Verify: user.onboardingCompleted set to true
   Verify: Redirected to appropriate dashboard
   ```

5. **Verify Cookie Isolation**
   ```
   Check: tutorials-auth-token only on tutorials.aotf.in
   Check: jobs-auth-token only on jobs.aotf.in
   Check: NO cookies from main app (aotf.in)
   ```

## Troubleshooting

### User can't log in on sub-app
- ✅ Verify user exists in MongoDB (check signup)
- ✅ Check NEXTAUTH_SECRET matches across environments
- ✅ Verify cookie domain is correct for environment

### Infinite redirect loop
- ✅ Check middleware logic for circular redirects
- ✅ Verify token decoding works correctly
- ✅ Check onboarding status in database

### Session not persisting
- ✅ Verify cookie domain doesn't have leading dot
- ✅ Check NEXTAUTH_URL matches actual domain
- ✅ Ensure HTTPS in production (secure cookies)

### User redirected to wrong app
- ✅ Check userType in session payload
- ✅ Verify getOnboardingRedirectUrl logic
- ✅ Check middleware route protection

## Future Enhancements

- [ ] Add SSO support across apps (if needed)
- [ ] Implement Redis-based rate limiting
- [ ] Add session analytics per app
- [ ] Email verification before choose-path
- [ ] Remember last-used platform per user
