import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Prevent direct access to /admin on main domain (admin runs on separate app)
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Main app does NOT handle login/onboarding - redirect to choose-path or appropriate sub-app
  // Block auth-protected routes (these exist in sub-apps only)
  const protectedRoutes = [
    '/teacher',
    '/guardian',
    '/feed',
    '/client',
    '/freelancer',
    '/dashboard',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Redirect to appropriate sub-app based on route
    const tutorialsRoutes = ['/teacher', '/guardian', '/feed'];
    const jobsRoutes = ['/client', '/freelancer'];
    
    const isTutorialsRoute = tutorialsRoutes.some(route => pathname.startsWith(route));
    const isJobsRoute = jobsRoutes.some(route => pathname.startsWith(route));

    if (isTutorialsRoute) {
      const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'https://tutorials.aotf.in';
      return NextResponse.redirect(new URL('/login', tutorialsUrl));
    }

    if (isJobsRoute) {
      const jobsUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || 'https://jobs.aotf.in';
      return NextResponse.redirect(new URL('/login', jobsUrl));
    }

    // Default: redirect to choose-path
    return NextResponse.redirect(new URL('/choose-path', request.url));
  }

  // Block /onboarding on main app - onboarding happens on sub-apps
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/choose-path', request.url));
  }
  
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
    
    // Validate content type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json(
          { success: false, error: 'Invalid content type. Expected application/json.' },
          { 
            status: 400,
            headers
          }
        );
      }
    }
    
    return response;
  }

  // Default: add security headers and continue
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
  ]
};
