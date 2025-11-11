import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancer extends Document {
  freelancerId: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  isWhatsappSameAsPhone: boolean;
  address: string;
  experience: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  maxQualification: string;
  schoolBoard?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: string;
  rating?: number;
  totalClients?: number;
  termsAgreed?: 'term-1';
  termsAgreedAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  registrationFeeStatus: 'pending' | 'paid' | 'failed';
  paymentVerifiedAt?: Date;
  notificationPreferences?: {
    marketingEmails: boolean;
    jobAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
function validateFreelancerId(id: string): boolean {
  return /^AOF-[A-Z0-9]{8}$/.test(id);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[+]?[1-9][\d\s\-()]{7,15}$/.test(phone.replace(/\s/g, ''));
}

const FreelancerSchema: Schema = new Schema({
  freelancerId: {
    type: String,
    required: [true, 'Freelancer ID is required'],
    unique: true,
    index: true,
    validate: {
      validator: validateFreelancerId,
      message: 'Freelancer ID must be in format AOF-XXXXXXXX'
    },
    immutable: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    lowercase: true,
    trim: true,
    validate: {
      validator: validateEmail,
      message: 'Please provide a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
    trim: true,
    validate: {
      validator: validatePhone,
      message: 'Please provide a valid phone number'
    }
  },
  whatsappNumber: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    maxlength: [20, 'WhatsApp number cannot exceed 20 characters'],
    trim: true,
    validate: {
      validator: validatePhone,
      message: 'Please provide a valid WhatsApp number'
    }
  },
  isWhatsappSameAsPhone: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [300, 'Address cannot exceed 300 characters'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    maxlength: [500, 'Experience cannot exceed 500 characters'],
    trim: true
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'expert'],
      message: 'Experience level must be beginner, intermediate, or expert'
    }
  },
  maxQualification: {
    type: String,
    required: [true, 'Maximum qualification is required'],
    maxlength: [100, 'Maximum qualification cannot exceed 100 characters'],
    trim: true
  },
  schoolBoard: {
    type: String,
    maxlength: [100, 'School board cannot exceed 100 characters'],
    trim: true
  },
  avatar: {
    type: String,
    maxlength: [500, 'Avatar URL cannot exceed 500 characters']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    trim: true
  },
  skills: [{
    type: String,
    maxlength: [50, 'Skill name cannot exceed 50 characters'],
    trim: true
  }],
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },
  availability: {
    type: String,
    maxlength: [200, 'Availability cannot exceed 200 characters'],
    trim: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  totalClients: {
    type: Number,
    min: [0, 'Total clients cannot be negative'],
    default: 0
  },
  termsAgreed: {
    type: String,
    enum: ['term-1']
  },
  termsAgreedAt: {
    type: Date
  },
  razorpayOrderId: {
    type: String,
    maxlength: [100, 'Razorpay Order ID cannot exceed 100 characters']
  },
  razorpayPaymentId: {
    type: String,
    maxlength: [100, 'Razorpay Payment ID cannot exceed 100 characters']
  },
  registrationFeeStatus: {
    type: String,
    required: [true, 'Registration fee status is required'],
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: 'Registration fee status must be pending, paid, or failed'
    },
    default: 'pending'
  },
  paymentVerifiedAt: {
    type: Date
  },
  notificationPreferences: {
    marketingEmails: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Index for efficient queries (email already indexed via unique: true)
FreelancerSchema.index({ registrationFeeStatus: 1 });
FreelancerSchema.index({ experienceLevel: 1 });

// Remove sensitive fields from JSON output
FreelancerSchema.methods.toJSON = function() {
  const freelancerObject = this.toObject();
  delete freelancerObject.__v;
  return freelancerObject;
};

export default (mongoose.models?.Freelancer as mongoose.Model<IFreelancer>) || 
  mongoose.model<IFreelancer>('Freelancer', FreelancerSchema);
