import NextAuth from "next-auth";
import { createAuthConfig } from "./config";

export const adminAuthConfig = createAuthConfig({ audience: "admin" });

const handler = NextAuth(adminAuthConfig);

// For App Router
export const GET = handler;
export const POST = handler;

// Legacy exports for backward compatibility
export const adminAuthHandlers = { GET: handler, POST: handler };
export { handler as adminAuth };
