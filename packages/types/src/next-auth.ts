import type { Session } from "next-auth";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { IAdmin } from "@aotf/models";

interface TeacherProfile {
  id: string;
  teacherId?: string;
  name?: string;
  registrationFeeStatus?: string | null;
}

interface GuardianProfile {
  id: string;
  guardianId?: string;
  name?: string;
  location?: string | null;
}

interface FreelancerProfile {
  id: string;
  freelancerId?: string;
  name?: string;
  registrationFeeStatus?: string | null;
}

interface ClientProfile {
  id: string;
  clientId?: string;
  name?: string;
  companyName?: string | null;
}

type AdminPermissions = IAdmin["permissions"];

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      userType?: "teacher" | "guardian" | "freelancer" | "client" | "admin" | null;
      onboardingCompleted?: boolean;
      createdAt?: string;
      teacherProfile?: TeacherProfile | null;
      guardianProfile?: GuardianProfile | null;
      freelancerProfile?: FreelancerProfile | null;
      clientProfile?: ClientProfile | null;
      role?: IAdmin["role"] | null;
      permissions?: AdminPermissions;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    userType?: "teacher" | "guardian" | "freelancer" | "client" | "admin" | null;
    onboardingCompleted?: boolean;
    createdAt?: string;
    teacherProfile?: TeacherProfile | null;
    guardianProfile?: GuardianProfile | null;
    freelancerProfile?: FreelancerProfile | null;
    clientProfile?: ClientProfile | null;
    role?: IAdmin["role"] | null;
    permissions?: AdminPermissions;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userId?: string;
    email?: string;
    name?: string | null;
    userType?: "teacher" | "guardian" | "freelancer" | "client" | "admin" | null;
    onboardingCompleted?: boolean;
    createdAt?: string | null;
    teacherProfile?: TeacherProfile | null;
    guardianProfile?: GuardianProfile | null;
    freelancerProfile?: FreelancerProfile | null;
    clientProfile?: ClientProfile | null;
    role?: IAdmin["role"] | null;
    permissions?: AdminPermissions;
    isAdmin?: boolean;
  }
}

export type AppSession = Session;
