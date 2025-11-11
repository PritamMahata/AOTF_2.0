import mongoose, { Schema, Document } from 'mongoose';

export interface IGuardian extends Document {
  guardianId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  grade?: string;
  subjectsOfInterest?: string[];
  learningMode?: string;
  whatsappNumber?: string;
  notificationPreferences?: {
    marketingEmails: boolean;
    teacherAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
function validateGuardianId(id: string): boolean {
  return /^AOG-[A-Z0-9]{5}$/.test(id);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[+]?[1-9][\d\s\-()]{7,15}$/.test(phone.replace(/\s/g, ''));
}

const GuardianSchema: Schema = new Schema({
  guardianId: {
    type: String,
    required: [true, 'Guardian ID is required'],
    unique: true,
    index: true,
    validate: {
      validator: validateGuardianId,
      message: 'Guardian ID must be in format AOG-XXXXX'
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
  grade: {
    type: String,
    maxlength: [50, 'Grade cannot exceed 50 characters'],
    trim: true
  },
  subjectsOfInterest: [{
    type: String,
    maxlength: [50, 'Subject name cannot exceed 50 characters'],
    trim: true
  }],
  learningMode: {
    type: String,
    enum: {
      values: ['online', 'in-person', 'both'],
      message: 'Learning mode must be online, in-person, or both'
    }
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
    teacherAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Indexes for performance
GuardianSchema.index({ createdAt: -1 });

// Static methods for common queries
GuardianSchema.statics.findByGuardianId = function(guardianId: string) {
  return this.findOne({ guardianId });
};

GuardianSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

GuardianSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$learningMode',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.models?.Guardian || mongoose.model<IGuardian>('Guardian', GuardianSchema);
