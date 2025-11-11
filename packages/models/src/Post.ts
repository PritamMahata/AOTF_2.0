import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  postId: string;
  guardianId?: string;
  clientId?: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  subject: string;
  className: string;
  board?: 'CBSE' | 'ICSE' | 'WBBSE' | 'ISC' | 'WBCHS';  
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek?: 'once' | 'twice' | 'thrice' | 'custom'; // Optional for client projects
  classType?: 'online' | 'in-person' | 'both'; // Optional for client projects
  location?: string;
  monthlyBudget?: number;
  notes?: string;
  description?: string;
  genderPreference?: string;
  status: 'open' | 'matched' | 'closed' | 'active';
  createdAt: Date;
  updatedAt: Date;
  applicants: mongoose.Types.ObjectId[];
  applications?: mongoose.Types.ObjectId[];
  editedBy?: 'guardian' | 'admin' | 'teacher' | 'client';
  editedAt?: Date;
  editedByUserId?: string;
  editedByName?: string;
  postedBy?: 'guardian' | 'client';
  // Client Project specific fields
  category?: string;
  subcategory?: string;
  projectType?: 'one-time' | 'ongoing' | 'consultation';
  budgetType?: 'fixed' | 'hourly';
  budgetAmount?: number;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
  expectedHours?: number;
  startDate?: string;
  deadline?: string;
  duration?: string;
  urgency?: 'flexible' | 'normal' | 'urgent';
  requiredSkills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  freelancerType?: 'individual' | 'team' | 'agency';
  preferredLocation?: string;
  languageRequirements?: string[];
}

const PostSchema: Schema = new Schema({
  postId: {type: String, required: true, unique: true, index: true },
  guardianId: { type: String, index: true }, // Index for efficient guardian-based queries
  clientId: { type: String, index: true }, // Index for efficient client-based queries
  userId: { type: String, required: true },
  name: { type: String },
  email: { type: String, index: true },
  phone: { type: String },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'WBBSE', 'ISC', 'WBCHS'] },  
  preferredTime: { type: String },
  preferredDays: { type: [String], default: [] },
  frequencyPerWeek: { type: String, enum: ['once', 'twice', 'thrice', 'custom'], required: false }, // Not required for client projects
  classType: { type: String, enum: ['online', 'in-person', 'both'], required: false }, // Not required for client projects
  location: { type: String },
  monthlyBudget: { type: Number },
  notes: { type: String },
  description: { type: String },
  genderPreference: { type: String },
  status: { type: String, enum: ['open', 'matched', 'closed', 'hold', 'active'], default: 'open' },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'Teacher', default: [] }],
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application', default: [] }],
  editedBy: { type: String, enum: ['guardian', 'admin', 'teacher', 'client'] },
  editedAt: { type: Date },
  editedByUserId: { type: String },
  editedByName: { type: String },
  postedBy: { type: String, enum: ['guardian', 'client'] },
  // Client Project specific fields
  category: { type: String },
  subcategory: { type: String },
  projectType: { type: String, enum: ['one-time', 'ongoing', 'consultation'] },
  budgetType: { type: String, enum: ['fixed', 'hourly'] },
  budgetAmount: { type: Number },
  budgetRangeMin: { type: Number },
  budgetRangeMax: { type: Number },
  expectedHours: { type: Number },
  startDate: { type: String },
  deadline: { type: String },
  duration: { type: String },
  urgency: { type: String, enum: ['flexible', 'normal', 'urgent'] },
  requiredSkills: { type: [String], default: [] },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
  freelancerType: { type: String, enum: ['individual', 'team', 'agency'] },
  preferredLocation: { type: String },
  languageRequirements: { type: [String], default: [] },
}, {
  timestamps: true,
  versionKey: '__v'
});

// Ensure latest schema in dev by deleting precompiled model
if (mongoose.models?.Post) {
  try {
    mongoose.deleteModel('Post');
  } catch {}
}

export default mongoose.models?.Post || mongoose.model<IPost>('Post', PostSchema);