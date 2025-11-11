import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken'
import type { NextResponse } from 'next/server'

export const AUTH_COOKIE_NAME = 'auth-token'
export const ADMIN_COOKIE_NAME = 'adminToken'
const AUTH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60

export interface VerifiedAuthToken {
  userId: string
  email?: string
  userType?: string | null
  sessionVersion?: number
  role?: string | null
  permissions?: Record<string, boolean>
  isAdmin?: boolean
  issuedAt?: number
  expiresAt?: number
}

function isLocalHostname(hostname: string): boolean {
  const normalised = hostname.toLowerCase()
  return (
    normalised === 'localhost' ||
    normalised.endsWith('.localhost') ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalised)
  )
}

function extractHostname(candidate?: string | null): string | null {
  if (!candidate) {
    return null
  }

  const trimmed = candidate.trim()
  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    return url.hostname
  } catch {
    // Not a URL, assume it is already a bare hostname
    return trimmed
  }
}

function deriveRootDomain(hostname: string): string | undefined {
  if (!hostname) {
    return undefined
  }

  const cleaned = hostname.replace(/^\.+/, '').toLowerCase()
  if (!cleaned || isLocalHostname(cleaned)) {
    return undefined
  }

  const parts = cleaned.split('.').filter(Boolean)
  if (parts.length <= 1) {
    return undefined
  }

  const topLevel = parts[parts.length - 1]
  const secondLevel = parts[parts.length - 2]
  const usesSecondLevelTld =
    topLevel.length === 2 && secondLevel && secondLevel.length <= 3 && parts.length >= 3

  const domainParts = usesSecondLevelTld ? parts.slice(-3) : parts.slice(-2)
  return domainParts.join('.')
}

function normaliseCookieDomain(domain?: string | null): string | undefined {
  if (!domain) {
    return undefined
  }

  const trimmed = domain.trim()
  if (!trimmed) {
    return undefined
  }

  if (isLocalHostname(trimmed)) {
    return undefined
  }

  return trimmed.replace(/^\.+/, '')
}

function resolveCookieDomain(): string | undefined {
  const explicit =
    process.env.NEXTAUTH_COOKIE_DOMAIN?.trim() ?? process.env.AUTH_COOKIE_DOMAIN?.trim()
  if (explicit) {
    const normalised = normaliseCookieDomain(explicit)
    if (normalised) {
      return normalised
    }
  }

  const derivedSources = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_TUTORIALS_APP_URL,
    process.env.APP_URL,
  ]

  for (const source of derivedSources) {
    const hostname = extractHostname(source)
    const root = hostname ? deriveRootDomain(hostname) : undefined
    const normalised = normaliseCookieDomain(root)
    if (normalised) {
      return normalised
    }
  }

  return undefined
}

function normaliseUserType(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function normaliseRole(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function normalisePermissions(value: unknown): Record<string, boolean> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, boolean>>(
    (acc, [key, entryValue]) => {
      if (typeof entryValue === 'boolean') {
        acc[key] = entryValue
      }
      return acc
    },
    {},
  )

  return Object.keys(entries).length > 0 ? entries : undefined
}

type MinimalCookieRecord = { value?: string } | string | null | undefined

type MinimalCookieStore = {
  get(name: string): MinimalCookieRecord
}

export function getAuthCookieNames(additional: string[] = []): string[] {
  const unique = new Set<string>()
  const candidates = [
    ...additional,
    process.env.NEXTAUTH_SESSION_COOKIE_NAME?.trim(),
    process.env.NEXTAUTH_COOKIE_NAME?.trim(),
    process.env.AUTH_COOKIE_NAME?.trim(),
    '__Secure-auth-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
    AUTH_COOKIE_NAME,
  ]

  for (const candidate of candidates) {
    if (candidate && !unique.has(candidate)) {
      unique.add(candidate)
    }
  }

  return Array.from(unique)
}

export function getAuthTokenFromCookies(
  cookies: MinimalCookieStore,
  additionalNames: string[] = [],
): string | null {
  for (const name of getAuthCookieNames(additionalNames)) {
    const raw = cookies.get(name)
    if (!raw) {
      continue
    }

    if (typeof raw === 'string' && raw.length > 0) {
      return raw
    }

    if (typeof raw === 'object' && typeof raw.value === 'string' && raw.value.length > 0) {
      return raw.value
    }
  }

  return null
}

export function verifyAuthToken(token: string): VerifiedAuthToken | null {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set. Unable to verify auth token.')
    return null
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & Record<string, unknown>
    const userId =
      typeof decoded.userId === 'string'
        ? decoded.userId
        : typeof decoded.sub === 'string'
          ? decoded.sub
          : undefined

    if (!userId) {
      return null
    }
    return {
      userId,
      email: typeof decoded.email === 'string' ? decoded.email : undefined,
      userType:
        normaliseUserType(decoded.userType) ??
        normaliseUserType((decoded as { role?: unknown }).role) ??
        null,
      sessionVersion:
        typeof decoded.sessionVersion === 'number' ? decoded.sessionVersion : undefined,
      role: normaliseRole((decoded as { role?: unknown }).role) ?? undefined,
      permissions: normalisePermissions(decoded.permissions),
      isAdmin: decoded.isAdmin === true,
      issuedAt: decoded.iat ? decoded.iat * 1000 : undefined,
      expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return null
    }

    if (!(error instanceof JsonWebTokenError)) {
      console.error('Error verifying auth token:', error)
    }

    // Try legacy token format
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      
      // Check if it's valid JSON before parsing
      if (!decoded || decoded.trim() === '' || decoded[0] !== '{') {
        return null;
      }
      
      const legacyData = JSON.parse(decoded) as {
        userId?: unknown
        id?: unknown
        email?: unknown
        userType?: unknown
        role?: unknown
        timestamp?: unknown
        sessionVersion?: unknown
        permissions?: unknown
        isAdmin?: unknown
      }

      const legacyUserId =
        typeof legacyData.userId === 'string'
          ? legacyData.userId
          : typeof legacyData.id === 'string'
            ? legacyData.id
            : undefined

      if (!legacyUserId) {
        return null
      }

      if (typeof legacyData.timestamp === 'number') {
        const age = Date.now() - legacyData.timestamp
        if (age > AUTH_TOKEN_LIFETIME_SECONDS * 1000 || age < 0) {
          return null
        }
      }

      return {
        userId: legacyUserId,
        email: typeof legacyData.email === 'string' ? legacyData.email : undefined,
        userType:
          normaliseUserType(legacyData.userType) ?? normaliseUserType(legacyData.role) ?? null,
        sessionVersion:
          typeof legacyData.sessionVersion === 'number' ? legacyData.sessionVersion : undefined,
        role: normaliseRole(legacyData.role) ?? undefined,
        permissions: normalisePermissions(legacyData.permissions),
        isAdmin: legacyData.isAdmin === true,
        issuedAt: typeof legacyData.timestamp === 'number' ? legacyData.timestamp : undefined,
        expiresAt:
          typeof legacyData.timestamp === 'number'
            ? legacyData.timestamp + AUTH_TOKEN_LIFETIME_SECONDS * 1000
            : undefined,
      }
    } catch (legacyParseError) {
      console.error('Failed to parse legacy auth token:', legacyParseError)
      return null
    }
  }
}

export function clearAuthCookie(
  response: NextResponse,
  cookieName = AUTH_COOKIE_NAME
): void {
  const cookieDomain = resolveCookieDomain()

  response.cookies.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  })
}
