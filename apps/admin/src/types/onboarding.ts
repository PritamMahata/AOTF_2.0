export type UserRole = "guardian" | "teacher" | null;
export type OnboardingStep = "role" | "details" | "verify" | "preferences" | "terms" | "payment" | "complete";

export interface FormData {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  grade?: string;
  subjectsOfInterest?: string[];
  learningMode?: string;
  subjectsTeaching?: string[];
  experience?: string;
  qualifications?: string;
  schoolBoard?: string;
  teachingMode?: string;
  bio?: string;
  location: string;
  emailVerified?: boolean;
  isPhoneWhatsApp?: boolean;
  whatsappNumber?: string;
}

export interface PaymentTerm {
  // id: "term-1" | "term-2";
  id: "term-1" ;
  title: string;
  description: string;
  color: string;
}

export const PAYMENT_TERMS: PaymentTerm[] = [
  {
    id: "term-1",
    title: "Upfront Payment (75%)",
    description: "Pay the consultancy 75% of their first month salary and take whole salary afterwards. (We're not the guaranteer of the tuition in any time being)",
    color: "text-green-600",
  },
  // {
  //   id: "term-2",
  //   title: "Option 2: Installment Payment (60% + 40%)",
  //   description: "Pay the 60% of first month salary and then pay 40% of 2nd month salary and then take whole salary afterwards. (We're not the guaranteer of the tuition in any time being)",
  //   color: "text-blue-600",
  // },
];

export const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics",
  "Accounting", "Art", "Music",
];

export const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12", "University Level",
];

export const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
];

export const LEARNING_MODES = [
  { value: "online", label: "Online Sessions" },
  { value: "in-person", label: "In-Person Sessions" },
  { value: "both", label: "Both Online & In-Person" },
];

export const SCHOOL_BOARDS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "ISC", label: "ISC" },
  { value: "WBBSE", label: "WBBSE" },
  { value: "WBCHS", label: "WBCHS" },
];

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: unknown;
  }
}