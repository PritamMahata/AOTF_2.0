export interface Application {
  _id: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  appliedAt: Date;
  teacher: {
    teacherId?: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    experience?: string;
    qualifications?: string;
    subjectsTeaching?: string[];
    teachingMode?: string;
    bio?: string;
    hourlyRate?: number;
    availability?: string;
    rating?: number;
    totalGuardians?: number;
    avatar?: string;
    whatsappNumber?: string;
  };
  postId: string;
}

export interface GuardianPost {
  id: number | string;
  postId?: string;
  userId?: string;
  guardian: string;
  guardianId?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianLocation?: string;
  guardianWhatsapp?: string;
  subject: string;
  class: string;
  board: string;
  location?: string;
  budget: string;
  monthlyBudget?: number;
  genderPreference: string;
  description: string;
  postedDate: string;
  applicants: number;
  status: string;
  classType?: string;
  frequency?: string;
  preferredTime?: string;
  preferredDays?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isOwner?: boolean;
  applications?: Application[];
  hasApplied?: boolean;
  hasApprovedTeacher?: boolean;
}

export interface TutorPost {
  id: number;
  tutor: {
    name: string;
    avatar: string;
    rating: number;
    experience: string;
    subjects: string[];
    location: string;
  };
  title: string;
  description: string;
  mode: string;
  price: string;
  availability: string;
  postedTime: string;
}

export interface Filters {
  search: string;
  subject: string;
  class: string;
  board: string;
  location: string;
}

export interface PostRequirementFormData {
  subject: string;
  class: string;
  board: string;
  location: string;
  budget: string;
  genderPreference: string;
  description: string;
}

export type UserRole = "teacher" | "guardian"; 