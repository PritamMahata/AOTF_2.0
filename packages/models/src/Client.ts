import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  clientId: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  address?: string;
  industry?: string;
  avatar?: string;
  bio?: string;
  totalJobsPosted?: number;
  rating?: number;
  notificationPreferences?: {
    marketingEmails: boolean;
    applicationAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
function validateClientId(id: string): boolean {
  return /^AOC-[A-Z0-9]{5}$/.test(id);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[+]?[1-9][\d\s\-()]{7,15}$/.test(phone.replace(/\s/g, ''));
}

const ClientSchema: Schema = new Schema({
  clientId: {
    type: String,
    required: [true, 'Client ID is required'],
    unique: true,
    index: true,
    validate: {
      validator: validateClientId,
      message: 'Client ID must be in format AOC-XXXXX'
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
    maxlength: [20, 'WhatsApp number cannot exceed 20 characters'],
    trim: true,
    default: ''
  },
  companyName: {
    type: String,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    trim: true
  },
  companyWebsite: {
    type: String,
    maxlength: [500, 'Company website cannot exceed 500 characters'],
    trim: true
  },
  address: {
    type: String,
    maxlength: [300, 'Address cannot exceed 300 characters'],
    trim: true
  },
  industry: {
    type: String,
    maxlength: [100, 'Industry cannot exceed 100 characters'],
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
  totalJobsPosted: {
    type: Number,
    min: [0, 'Total jobs posted cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  notificationPreferences: {
    marketingEmails: {
      type: Boolean,
      default: true
    },
    applicationAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Index for efficient queries (email already indexed via unique: true)

// Remove sensitive fields from JSON output
ClientSchema.methods.toJSON = function() {
  const clientObject = this.toObject();
  delete clientObject.__v;
  return clientObject;
};

export default (mongoose.models?.Client as mongoose.Model<IClient>) || 
  mongoose.model<IClient>('Client', ClientSchema);
