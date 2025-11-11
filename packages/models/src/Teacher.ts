import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience?: string;
  qualifications?: string;
  schoolBoard?: string;
  subjectsTeaching?: string[];
  teachingMode?: string;
  bio?: string;
  hourlyRate?: string;
  availability?: string;
  rating?: number;
  totalGuardians?: number;
  avatar?: string;
  termsAgreed?: 'term-1';
  // termsAgreed?: 'term-1' | 'term-2';
  termsAgreedAt?: Date;
  consultancyPaymentType?: 'upfront-75' | 'installment-60-40';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  registrationFeeStatus: 'pending' | 'paid' | 'failed';
  paymentVerifiedAt?: Date;
  notificationPreferences?: {
    marketingEmails: boolean;
    guardianResponses: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  whatsappNumber?: string;
}

// Validation functions
function validateTeacherId(id: string): boolean {
  return /^AOT-[A-Z0-9]{8}$/.test(id);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[+]?[1-9][\d\s\-()]{7,15}$/.test(phone.replace(/\s/g, ''));
}

const TeacherSchema: Schema = new Schema({
  teacherId: {
    type: String,
    required: [true, 'Teacher ID is required'],
    unique: true,
    index: true,
    validate: {
      validator: validateTeacherId,
      message: 'Teacher ID must be in format AOT-XXXXXXXX'
    },
    immutable: true // Prevent modifications after creation
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
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [200, 'Location cannot exceed 200 characters'],
    trim: true
  },
  experience: {
    type: String,
    maxlength: [50, 'Experience cannot exceed 50 characters'],
    trim: true
  },
  qualifications: {
    type: String,
    maxlength: [500, 'Qualifications cannot exceed 500 characters'],
    trim: true
  },
  schoolBoard: {
    type: String,
    enum: {
      values: ['CBSE', 'ICSE', 'ISC', 'WBBSE', 'WBCHS'],
      message: 'School board must be CBSE, ICSE, ISC, WBBSE, or WBCHS'
    },
    trim: true
  },
  subjectsTeaching: [{
    type: String,
    maxlength: [50, 'Subject name cannot exceed 50 characters'],
    trim: true
  }],
  teachingMode: {
    type: String,
    enum: {
      values: ['online', 'in-person', 'both'],
      message: 'Teaching mode must be online, in-person, or both'
    }
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    trim: true
  },
  hourlyRate: {
    type: String,
    maxlength: [20, 'Hourly rate cannot exceed 20 characters'],
    trim: true
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
  totalGuardians: {
    type: Number,
    min: [0, 'Total guardians cannot be negative'],
    default: 0
  },
  avatar: {
    type: String,
    maxlength: [500, 'Avatar URL cannot exceed 500 characters'],
    trim: true
  },
  termsAgreed: {
    type: String,
    enum: {
      values: ['term-1'],
      message: 'Terms agreed must be either term-1'
      // values: ['term-1', 'term-2'],
      // message: 'Terms agreed must be either term-1 or term-2'
    },
    default: null
  },
  termsAgreedAt: {
    type: Date,
    default: null
  },
  consultancyPaymentType: {
    type: String,
    enum: {
      values: ['upfront-75', 'installment-60-40'],
      message: 'Payment type must be either upfront-75 or installment-60-40'
    },
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: '',
    maxlength: [50, 'Razorpay Order ID cannot exceed 50 characters'],
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    default: '',
    maxlength: [50, 'Razorpay Payment ID cannot exceed 50 characters'],
    trim: true
  },
  registrationFeeStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: 'Registration fee status must be pending, paid, or failed'
    },
    default: 'pending',
    required: [true, 'Registration fee status is required']
  },
  paymentVerifiedAt: {
    type: Date,
    default: null
  },  whatsappNumber: {
    type: String,
    maxlength: [20, 'WhatsApp number cannot exceed 20 characters'],
    trim: true,
    default: ''
  },
  notificationPreferences: {
    marketingEmails: {
      type: Boolean,
      default: true
    },
    guardianResponses: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  // Add version key for optimistic concurrency control
  versionKey: '__v'
});

// Indexes for performance
TeacherSchema.index({ registrationFeeStatus: 1, createdAt: -1 });
TeacherSchema.index({ termsAgreed: 1, termsAgreedAt: -1 });

// Pre-save middleware for additional validation
TeacherSchema.pre('save', function(next) {
  next();
});

// Static methods for common queries
TeacherSchema.statics.findByTeacherId = function(teacherId: string) {
  return this.findOne({ teacherId });
};

TeacherSchema.statics.findPaidTeachers = function() {
  return this.find({ registrationFeeStatus: 'paid' });
};

TeacherSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$registrationFeeStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.models?.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
