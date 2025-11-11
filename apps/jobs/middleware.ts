import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthTokenFromCookies } from '@aotf/lib/auth-token';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window per IP

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitInfo(ip: string) {
  const now = Date.now();
  const current = rateLimitMap.get(ip);
  
  if (!current || now > current.resetTime) {
    const newLimit = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
    rateLimitMap.set(ip, newLimit);
    return newLimit;
  }
  
  current.count++;
  rateLimitMap.set(ip, current);
  return current;
}

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers for all responses
  const headers = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  };

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes that require authentication
  const protectedRoutes = [
    '/client',
    '/freelancer',
    '/onboarding',
    '/dashboard',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request);
    const rateLimitInfo = getRateLimitInfo(ip);
    
    const response = NextResponse.next();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateLimitInfo.count).toString());
    response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
    
    // Add security headers
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Block if rate limit exceeded
    if (rateLimitInfo.count > RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }
    
    return response;
  }
  // For protected routes, check authentication and onboarding status
  if (isProtectedRoute) {
    // Get session token (jobs-auth-token for this app)
    const token = getAuthTokenFromCookies(request.cookies, ['jobs-auth-token']);
    
    if (!token) {
      // No session, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to check onboarding status
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      // If user hasn't completed onboarding, redirect to onboarding
      // (unless already on onboarding page)
      if (!payload.onboardingCompleted && !pathname.startsWith('/onboarding')) {
        const onboardingUrl = new URL('/onboarding', request.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // If user completed onboarding but is on onboarding page, redirect to dashboard
      if (payload.onboardingCompleted && pathname.startsWith('/onboarding')) {
        const userType = payload.userType;
        const dashboardUrl = userType === 'freelancer' 
          ? new URL('/freelancer/dashboard', request.url)
          : new URL('/client/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      // Invalid token, redirect to login
      console.error('Error decoding token:', error);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow public routes and other requests
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
