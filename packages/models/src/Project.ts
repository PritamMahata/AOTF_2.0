import mongoose, { Schema, Document } from 'mongoose';

/**
 * Project Model - For Client/Freelancer Job Postings
 * Separate from Post model which is used for Guardian/Teacher tutoring posts
 */
export interface IProject extends Document {
  projectId: string; // Unique project ID (e.g., "PRJ-04112501")
  clientId: string; // Reference to Client
  userId: string; // Reference to User
  name: string; // Client name
  email: string; // Client email
  phone?: string; // Client phone
  
  // Project Details
  projectTitle: string; // Main title/subject
  category: string; // Main category (e.g., "Web Development", "Design", "Writing")
  subcategory?: string; // Subcategory (e.g., "Frontend", "Logo Design")
  description: string; // Detailed project description
  
  // Project Type & Timeline
  projectType: 'one-time' | 'ongoing' | 'consultation';
  startDate?: string;
  deadline?: string;
  duration?: string; // e.g., "1 month", "3 weeks"
  urgency: 'flexible' | 'normal' | 'urgent';
  
  // Budget
  budgetType: 'fixed' | 'hourly';
  budgetAmount?: number; // For fixed budget
  budgetRangeMin?: number; // For range budget
  budgetRangeMax?: number; // For range budget
  expectedHours?: number; // Estimated hours
  
  // Requirements
  requiredSkills: string[]; // Array of required skills
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  freelancerType: 'individual' | 'team' | 'agency';
  preferredLocation?: string; // Location preference
  languageRequirements?: string[]; // Required languages
  
  // Status & Management
  status: 'open' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  applicants: (mongoose.Types.ObjectId | string)[]; // Array of freelancer IDs who applied
  applications?: mongoose.Types.ObjectId[]; // Array of Application document IDs
  selectedFreelancerId?: string; // Freelancer selected for the project
  
  // Edit History
  editedBy?: 'client' | 'admin';
  editedAt?: Date;
  editedByUserId?: string;
  editedByName?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  projectId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  clientId: { 
    type: String, 
    required: true, 
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  phone: { 
    type: String 
  },
  
  // Project Details
  projectTitle: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  subcategory: { 
    type: String,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  // Project Type & Timeline
  projectType: { 
    type: String, 
    enum: ['one-time', 'ongoing', 'consultation'],
    required: true
  },
  startDate: { 
    type: String 
  },
  deadline: { 
    type: String 
  },
  duration: { 
    type: String 
  },
  urgency: { 
    type: String, 
    enum: ['flexible', 'normal', 'urgent'],
    default: 'normal'
  },
  
  // Budget
  budgetType: { 
    type: String, 
    enum: ['fixed', 'hourly'],
    required: true
  },
  budgetAmount: { 
    type: Number,
    min: 0
  },
  budgetRangeMin: { 
    type: Number,
    min: 0
  },
  budgetRangeMax: { 
    type: Number,
    min: 0
  },
  expectedHours: { 
    type: Number,
    min: 0
  },
  
  // Requirements
  requiredSkills: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(skills: string[]) {
        return skills.length <= 20; // Max 20 skills
      },
      message: 'Maximum 20 skills allowed'
    }
  },
  experienceLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'intermediate'
  },
  freelancerType: { 
    type: String, 
    enum: ['individual', 'team', 'agency'],
    default: 'individual'
  },
  preferredLocation: { 
    type: String 
  },
  languageRequirements: { 
    type: [String], 
    default: [] 
  },
  
  // Status & Management
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'open',
    index: true
  },
  applicants: [{ 
    type: Schema.Types.Mixed, // Can be ObjectId or String (freelancerId)
    default: [] 
  }],
  applications: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Application',
    default: [] 
  }],
  selectedFreelancerId: { 
    type: String 
  },
  
  // Edit History
  editedBy: { 
    type: String, 
    enum: ['client', 'admin'] 
  },
  editedAt: { 
    type: Date 
  },
  editedByUserId: { 
    type: String 
  },
  editedByName: { 
    type: String 
  },
}, {
  timestamps: true,
  versionKey: '__v',
  collection: 'projects' // Explicit collection name
});

// Indexes for efficient queries
ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ urgency: 1, status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ budgetAmount: 1 });
ProjectSchema.index({ requiredSkills: 1 });

// Virtual for applicant count
ProjectSchema.virtual('applicantCount').get(function(this: IProject) {
  return this.applicants ? this.applicants.length : 0;
});

// Ensure virtuals are included in JSON
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

// Ensure latest schema in dev by deleting precompiled model
if (mongoose.models?.Project) {
  try {
    mongoose.deleteModel('Project');
  } catch (e) {
    // Ignore error if model doesn't exist
  }
}

export default mongoose.models?.Project || mongoose.model<IProject>('Project', ProjectSchema);
