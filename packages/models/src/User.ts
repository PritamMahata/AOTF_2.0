import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role?: 'teacher' | 'guardian' | 'freelancer' | 'client' | null;
  onboardingCompleted: boolean;
  // Operational email health flags (set by webhook)
  emailStatus?: {
    bounced?: boolean;
    bouncedAt?: Date;
    bounceReason?: string;
  };
  emailVerification?: {
    verified: boolean;
    otpHash?: string;
    otpExpiresAt?: Date;
    welcomeSent?: boolean;
  };
  passwordReset?: {
    otpHash?: string;
    otpExpiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// Validation functions
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const UserSchema: Schema = new Schema({
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },  role: {
    type: String,
    enum: ['teacher', 'guardian', 'freelancer', 'client'],
    default: null
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  emailStatus: {
    bounced: { type: Boolean, default: false },
    bouncedAt: { type: Date, default: undefined },
    bounceReason: { type: String, default: undefined }
  },
  emailVerification: {
    verified: { type: Boolean, default: false },
    otpHash: { type: String, default: undefined },
    otpExpiresAt: { type: Date, default: undefined },
    welcomeSent: { type: Boolean, default: false }
  },
  passwordReset: {
    otpHash: { type: String, default: undefined },
    otpExpiresAt: { type: Date, default: undefined }
  }
}, {
  timestamps: true,
  versionKey: '__v'
});

// Index is already created by unique: true, no need for explicit index

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Ensure password is a string before hashing
    this.password = crypto.createHash('sha256').update(String(this.password)).digest('hex');
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const hashedInput = crypto.createHash('sha256').update(String(candidatePassword)).digest('hex');
    return hashedInput === this.password;
  } catch (error) {
    console.error('Error comparing passwords:', error); 
    return false;
  }
};

// Static methods for common queries
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Remove sensitive fields from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.emailVerification?.otpHash;
  delete userObject.passwordReset?.otpHash;
  return userObject;
};

export default (mongoose.models?.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);
