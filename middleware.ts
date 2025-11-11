import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@aotf/lib/auth-token';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window per IP

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitInfo(ip: string) {
  const now = Date.now();
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    const newLimit = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, newLimit);
    return newLimit;
  }

  current.count++;
  rateLimitMap.set(ip, current);
  return current;
}

// ----------------------------
// Utility Functions
// ----------------------------
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  return realIP || remoteAddr || 'unknown';
}

/**
 * Extract subdomain from hostname
 * Works for both local (`admin.aotf.local`) and production (`admin.aotf.in`)
 */
function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (
    hostname === 'localhost' ||
    hostname.startsWith('localhost:') ||
    hostname.startsWith('127.0.0.1')
  ) {
    return null;
  }

  const parts = hostname.split('.');

  // Example: admin.aotf.local => ['admin', 'aotf', 'local']
  // Example: tutorials.aotf.in => ['tutorials', 'aotf', 'in']
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

// ----------------------------
// Middleware
// ----------------------------
export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const subdomain = getSubdomain(hostname);

  const isAdminSubdomain = subdomain === 'admin';
  const isMainSubdomain = !subdomain || subdomain === 'main';
  const isTutorialsSubdomain = subdomain === 'tutorials';
  const isJobsSubdomain = subdomain === 'jobs';

  const headers = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  };

  // ----------------------------
  // 🔹 Subdomain-based routing
  // ----------------------------
  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    const response = NextResponse.rewrite(url);
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  if (isMainSubdomain && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ----------------------------
  // 🔹 Tutorials redirection
  // ----------------------------
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isGuardianRoute = pathname.startsWith('/guardian');
  const isFeedRoute = pathname.startsWith('/feed');

  if (isTeacherRoute || isGuardianRoute || isFeedRoute) {
    const tutorialsUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || 'http://tutorials.aotf.local';
    return NextResponse.redirect(new URL(pathname + request.nextUrl.search, tutorialsUrl));
  }


  // ----------------------------
  // 🔹 Rate Limiting for APIs
  // ----------------------------
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request);
    const rate = getRateLimitInfo(ip);

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - rate.count).toString());
    response.headers.set('X-RateLimit-Reset', rate.resetTime.toString());
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));

    if (rate.count > RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rate.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((rate.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Validate JSON content-type
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json({ success: false, error: 'Invalid content type. Expected application/json.' }, { status: 400, headers });
      }
    }

    return response;
  }

  // ----------------------------
  // ✅ Default response
  // ----------------------------
  const response = NextResponse.next();
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
  ],
};
