import type { NextAuthOptions, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectToDatabase from "@aotf/lib/mongodb";
import { User, Teacher, Guardian, Freelancer, Client, Admin } from "@aotf/models";
import type { IAdmin, IUser } from "@aotf/models";
import type { Document } from "mongoose";

const DEFAULT_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type AuthAudience = "user" | "admin";
export type AppName = "tutorials" | "jobs" | "main" | "admin";

export interface CreateAuthConfigOptions {
  audience: AuthAudience;
  appName?: AppName;
  sessionCookieName?: string;
  sessionMaxAgeSeconds?: number;
  cookieDomain?: string; // Allow explicit cookie domain override
}

type TeacherProfile = {
  id: string;
  teacherId?: string;
  name?: string;
  registrationFeeStatus?: string | null;
};

type GuardianProfile = {
  id: string;
  guardianId?: string;
  name?: string;
  location?: string | null;
};

type FreelancerProfile = {
  id: string;
  freelancerId?: string;
  name?: string;
  registrationFeeStatus?: string | null;
};

type ClientProfile = {
  id: string;
  clientId?: string;
  name?: string;
  companyName?: string | null;
};

type AdminPermissions = IAdmin["permissions"];

type BaseUserPayload = {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
  onboardingCompleted?: boolean;
};

type SessionUserPayload = BaseUserPayload & {
  userType?: "teacher" | "guardian" | "freelancer" | "client" | "admin" | null;
  teacherProfile?: TeacherProfile | null;
  guardianProfile?: GuardianProfile | null;
  freelancerProfile?: FreelancerProfile | null;
  clientProfile?: ClientProfile | null;
  role?: IAdmin["role"] | null;
  permissions?: AdminPermissions;
  isAdmin?: boolean;
};

const ADMIN_ERROR_MESSAGE = "Invalid email or password";
const USER_ERROR_MESSAGE = "Invalid email or password";

function toStringId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof (value as { toString: () => string }).toString === "function") {
    return (value as { toString: () => string }).toString();
  }

  return String(value ?? "");
}

function normaliseTeacherProfile(teacher?: Document | null): TeacherProfile | null {
  if (!teacher) {
    return null;
  }

  const profile = teacher.toObject ? teacher.toObject() : teacher;

  return {
    id: toStringId(profile._id),
    teacherId: typeof profile.teacherId === "string" ? profile.teacherId : undefined,
    name: typeof profile.name === "string" ? profile.name : undefined,
    registrationFeeStatus: typeof profile.registrationFeeStatus === "string"
      ? profile.registrationFeeStatus
      : profile.registrationFeeStatus ?? null,
  };
}

function normaliseGuardianProfile(guardian?: Document | null): GuardianProfile | null {
  if (!guardian) {
    return null;
  }

  const profile = guardian.toObject ? guardian.toObject() : guardian;

  return {
    id: toStringId(profile._id),
    guardianId: typeof profile.guardianId === "string" ? profile.guardianId : undefined,
    name: typeof profile.name === "string" ? profile.name : undefined,
    location: typeof profile.location === "string" ? profile.location : undefined,
  };
}

function normaliseFreelancerProfile(freelancer?: Document | null): FreelancerProfile | null {
  if (!freelancer) {
    return null;
  }

  const profile = freelancer.toObject ? freelancer.toObject() : freelancer;

  return {
    id: toStringId(profile._id),
    freelancerId: typeof profile.freelancerId === "string" ? profile.freelancerId : undefined,
    name: typeof profile.name === "string" ? profile.name : undefined,
    registrationFeeStatus: typeof profile.registrationFeeStatus === "string"
      ? profile.registrationFeeStatus
      : profile.registrationFeeStatus ?? null,
  };
}

function normaliseClientProfile(client?: Document | null): ClientProfile | null {
  if (!client) {
    return null;
  }

  const profile = client.toObject ? client.toObject() : client;

  return {
    id: toStringId(profile._id),
    clientId: typeof profile.clientId === "string" ? profile.clientId : undefined,
    name: typeof profile.name === "string" ? profile.name : undefined,
    companyName: typeof profile.companyName === "string" ? profile.companyName : profile.companyName ?? null,
  };
}

function isLocalHostname(hostname: string): boolean {
  const normalised = hostname.toLowerCase();
  return (
    normalised === 'localhost' ||
    normalised.endsWith('.localhost') ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalised)
  );
}

function extractHostname(candidate?: string | null): string | null {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return url.hostname;
  } catch {
    // Not a URL, assume it is already a bare hostname
    return trimmed;
  }
}

function deriveRootDomain(hostname: string): string | undefined {
  if (!hostname) {
    return undefined;
  }

  const cleaned = hostname.replace(/^\.+/, '').toLowerCase();
  if (!cleaned || isLocalHostname(cleaned)) {
    return undefined;
  }

  const parts = cleaned.split('.').filter(Boolean);
  if (parts.length <= 1) {
    return undefined;
  }

  const topLevel = parts[parts.length - 1];
  const secondLevel = parts[parts.length - 2];
  const usesSecondLevelTld =
    topLevel.length === 2 && secondLevel && secondLevel.length <= 3 && parts.length >= 3;

  const domainParts = usesSecondLevelTld ? parts.slice(-3) : parts.slice(-2);
  return domainParts.join('.');
}

function normaliseCookieDomain(domain?: string | null): string | undefined {
  if (!domain) {
    return undefined;
  }

  const trimmed = domain.trim();
  if (!trimmed) {
    return undefined;
  }

  if (isLocalHostname(trimmed)) {
    return undefined;
  }

  return trimmed.replace(/^\.+/, '');
}

function resolveCookieDomain(options?: { appName?: AppName; cookieDomain?: string }): string | undefined {
  // 1. Use explicit override if provided
  if (options?.cookieDomain) {
    const normalized = normaliseCookieDomain(options.cookieDomain);
    if (normalized) {
      console.log(`🍪 Using explicit cookie domain: ${normalized}`);
      return normalized;
    }
  }

  // 2. Check for environment-specific cookie domain
  const fromEnv = process.env.NEXTAUTH_COOKIE_DOMAIN?.trim();
  if (fromEnv) {
    console.log(`🍪 Using NEXTAUTH_COOKIE_DOMAIN: ${fromEnv}`);
    return fromEnv;
  }

  const legacy = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (legacy) {
    console.log(`🍪 Using AUTH_COOKIE_DOMAIN: ${legacy}`);
    return legacy;
  }

  // 3. App-specific subdomain logic (DO NOT share cookies across subdomains)
  // Each app gets its own domain without leading dot
  if (options?.appName) {
    const appEnvVars: Record<AppName, string | undefined> = {
      tutorials: process.env.NEXT_PUBLIC_TUTORIALS_APP_URL,
      jobs: process.env.NEXT_PUBLIC_JOBS_APP_URL,
      main: process.env.NEXT_PUBLIC_MAIN_APP_URL,
      admin: process.env.NEXT_PUBLIC_ADMIN_APP_URL,
    };

    const appUrl = appEnvVars[options.appName];
    if (appUrl) {
      const hostname = extractHostname(appUrl);
      if (hostname && !isLocalHostname(hostname)) {
        // Return the full subdomain WITHOUT a leading dot to restrict cookie to that subdomain only
        console.log(`🍪 App-specific cookie domain for ${options.appName}: ${hostname}`);
        return hostname;
      }
    }
  }

  // 4. For localhost/development, do NOT set a domain (undefined means current host only)
  console.log(`🍪 No cookie domain set (localhost or development mode)`);
  return undefined;
}

function toPlainPermissions(permissions?: AdminPermissions): AdminPermissions | undefined {
  if (!permissions) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(permissions)) as AdminPermissions;
}

export function createAuthConfig(options: CreateAuthConfigOptions): NextAuthOptions {
  const { audience, appName, sessionCookieName, sessionMaxAgeSeconds, cookieDomain } = options;
  
  // Cookie naming: each app gets unique cookie name to prevent conflicts
  const defaultCookieName = appName 
    ? `${appName}-auth-token`
    : audience === "admin" ? "adminToken" : "auth-token";
  
  const cookieName = sessionCookieName ?? defaultCookieName;
  
  // Resolve cookie domain based on app configuration
  const resolvedCookieDomain = resolveCookieDomain({ appName, cookieDomain });
  
  const secure = process.env.NODE_ENV === "production";
  const maxAge = sessionMaxAgeSeconds ?? DEFAULT_SESSION_MAX_AGE_SECONDS;

  console.log(`🔐 NextAuth Config: audience=${audience}, app=${appName}, cookie=${cookieName}, domain=${resolvedCookieDomain || 'current-host-only'}`);

  const providers = [
    Credentials({
      id: audience === "admin" ? "admin-credentials" : "user-credentials",
      name: audience === "admin" ? "Admin Credentials" : "Email & Password",
      async authorize(credentials: Record<string, unknown> | undefined) {
        const email = credentials?.email?.toString().toLowerCase().trim();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        await connectToDatabase();

        if (audience === "admin") {
          const admin = await Admin.findOne({ email });
          if (!admin) {
            throw new Error(ADMIN_ERROR_MESSAGE);
          }

          if (!admin.isActive) {
            throw new Error("Admin account is deactivated");
          }

          const isPasswordValid = await admin.comparePassword(password);
          if (!isPasswordValid) {
            throw new Error(ADMIN_ERROR_MESSAGE);
          }

          admin.lastLogin = new Date();
          await admin.save();

          return {
            id: toStringId(admin._id),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: toPlainPermissions(admin.permissions),
            isAdmin: true,
            userType: "admin",
            createdAt: admin.createdAt?.toISOString(),
            onboardingCompleted: true,
          } satisfies SessionUserPayload;
        }

        const user = await User.findOne({ email });
        if (!user) {
          throw new Error(USER_ERROR_MESSAGE);
        }

        const isPasswordValid = await (user as IUser).comparePassword(password);
        if (!isPasswordValid) {
          throw new Error(USER_ERROR_MESSAGE);
        }        const teacher = await Teacher.findOne({ email });
        const guardian = await Guardian.findOne({ email });
        const freelancer = await Freelancer.findOne({ email });
        const client = await Client.findOne({ email });

        let userType: SessionUserPayload["userType"] = null;
        if (teacher) {
          userType = "teacher";
        } else if (guardian) {
          userType = "guardian";
        } else if (freelancer) {
          userType = "freelancer";
        } else if (client) {
          userType = "client";
        } else if (user.role) {
          userType = user.role;
        }

        const teacherProfile = normaliseTeacherProfile(teacher);
        const guardianProfile = normaliseGuardianProfile(guardian);
        const freelancerProfile = normaliseFreelancerProfile(freelancer);
        const clientProfile = normaliseClientProfile(client);

        return {
          id: toStringId(user._id),
          email: user.email,
          name: user.name || null,
          userType,
          teacherProfile,
          guardianProfile,
          freelancerProfile,
          clientProfile,
          onboardingCompleted: Boolean(user.onboardingCompleted),
          createdAt: user.createdAt?.toISOString(),
          isAdmin: false,
        } satisfies SessionUserPayload;
      },
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ];

  const baseConfig: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    session: {
      strategy: "jwt",
      maxAge,
    },
    cookies: {
      sessionToken: {
        name: cookieName,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
          ...(resolvedCookieDomain ? { domain: resolvedCookieDomain } : {}),
        },
      },
      // Ensure CSRF token is also properly configured
      csrfToken: {
        name: `${cookieName}.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
          ...(resolvedCookieDomain ? { domain: resolvedCookieDomain } : {}),
        },
      },    },
    providers,
    pages: {
      signIn: audience === "admin" ? "/admin/login" : "/onboarding",
    },
    callbacks: {
      async redirect({ url, baseUrl }) {
        // For admin audience, handle admin redirects
        if (audience === "admin") {
          // If trying to access the base URL, redirect to admin dashboard
          if (url === baseUrl || url === `${baseUrl}/`) {
            return `${baseUrl}/admin/dashboard`;
          }
          // Allow callback URLs that start with base URL
          if (url.startsWith(baseUrl)) {
            return url;
          }
          // Default admin redirect
          return `${baseUrl}/admin/dashboard`;
        }

        // For user audience (Jobs/Tutorials app)
        // Get the app URLs from environment
        const jobsAppUrl = process.env.NEXT_PUBLIC_JOBS_APP_URL || "https://job.aotf.in";
        const tutorialsAppUrl = process.env.NEXT_PUBLIC_TUTORIALS_APP_URL || "https://tutorials.aotf.in";
        const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://aotf.in";

        // If URL is from main app (aotf.in), redirect based on user type
        if (url.startsWith(mainAppUrl)) {
          // Try to get user type from the URL or token (will be set during JWT callback)
          // For now, default to client dashboard - will be updated in session
          console.log(`🔄 Redirecting from main app to Jobs app`);
          return `${jobsAppUrl}/client/dashboard`;
        }

        // If callback URL is for Jobs app, allow it
        if (url.startsWith(jobsAppUrl)) {
          return url;
        }

        // If callback URL is for Tutorials app, allow it
        if (url.startsWith(tutorialsAppUrl)) {
          return url;
        }

        // If URL starts with base URL, allow it
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // If it's a relative URL, prepend base URL
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // Default: redirect to Jobs app client dashboard
        console.log(`🔄 Default redirect to Jobs app`);
        return `${jobsAppUrl}/client/dashboard`;
      },
      async jwt({ token, user }) {
        if (user) {
          const payload = user as SessionUserPayload;

          token.id = payload.id;
          token.sub = payload.id;
          token.userId = payload.id;
          token.email = payload.email;
          token.name = payload.name ?? undefined;
          token.userType = payload.userType ?? null;
          token.role = payload.role ?? null;
          token.permissions = payload.permissions ? toPlainPermissions(payload.permissions) : undefined;
          token.teacherProfile = payload.teacherProfile ?? null;
          token.guardianProfile = payload.guardianProfile ?? null;
          token.freelancerProfile = payload.freelancerProfile ?? null;
          token.clientProfile = payload.clientProfile ?? null;
          token.onboardingCompleted = payload.onboardingCompleted ?? false;
          token.createdAt = payload.createdAt ?? null;
          token.isAdmin = payload.isAdmin ?? false;
        }

        return token;
      },
      async session({ session, token }) {
        const sessionUser: Session["user"] & SessionUserPayload = {
          ...session.user,
          id: typeof token.id === "string" ? token.id : token.sub?.toString() ?? "",
          email: typeof token.email === "string" ? token.email : session.user?.email ?? "",
          name: typeof token.name === "string" ? token.name : session.user?.name ?? null,
          userType: (token.userType as SessionUserPayload["userType"]) ?? null,
          teacherProfile: (token.teacherProfile as TeacherProfile | null) ?? null,
          guardianProfile: (token.guardianProfile as GuardianProfile | null) ?? null,
          freelancerProfile: (token.freelancerProfile as FreelancerProfile | null) ?? null,
          clientProfile: (token.clientProfile as ClientProfile | null) ?? null,
          role: (token.role as SessionUserPayload["role"]) ?? null,
          permissions: toPlainPermissions(token.permissions as AdminPermissions | undefined),
          onboardingCompleted: Boolean(token.onboardingCompleted),
          createdAt: typeof token.createdAt === "string" ? token.createdAt : undefined,
          isAdmin: Boolean(token.isAdmin),
        };

        return {
          ...session,
          user: sessionUser,
        };
      },
    },
  };

  return {
    ...baseConfig,
    trustHost: true,
  } as NextAuthOptions;
}
