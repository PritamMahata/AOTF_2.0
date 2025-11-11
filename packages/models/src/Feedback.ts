import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  userRole: 'guardian' | 'teacher' | 'admin';
  feedbackType: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number; // 1-5 stars
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ['guardian', 'teacher', 'admin'],
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ['bug', 'feature', 'improvement', 'general'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ feedbackType: 1, createdAt: -1 });

const Feedback: Model<IFeedback> =
  mongoose.models?.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;