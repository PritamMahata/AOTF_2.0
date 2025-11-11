import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  postId: Types.ObjectId;
  teacherId?: Types.ObjectId; // For tutorials app
  freelancerId?: string; // For jobs app (using custom ID)
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'withdrawal-requested' | 'withdrawn';
  appliedAt: Date;
  declineReason?: string; // Reason for decline (manual or auto)
  autoDeclined?: boolean; // Flag to indicate if auto-declined
  withdrawalRequestedAt?: Date;
  withdrawalRequestedBy?: string; // teacherId/freelancerId who requested
  withdrawalApprovedAt?: Date;
  withdrawalApprovedBy?: string; // adminId who approved
  withdrawalRejectedAt?: Date;
  withdrawalRejectedBy?: string; // adminId who rejected
  withdrawalNote?: string; // Note from teacher/freelancer explaining withdrawal
}

const ApplicationSchema: Schema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: false }, // Optional for tutorials app
  freelancerId: { type: String, required: false }, // Optional for jobs app
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined', 'completed', 'withdrawal-requested', 'withdrawn'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now },
  declineReason: { type: String },
  autoDeclined: { type: Boolean, default: false },
  withdrawalRequestedAt: { type: Date },
  withdrawalRequestedBy: { type: String },
  withdrawalApprovedAt: { type: Date },
  withdrawalApprovedBy: { type: String },
  withdrawalRejectedAt: { type: Date },
  withdrawalRejectedBy: { type: String },
  withdrawalNote: { type: String, maxlength: 500 },
});

export default mongoose.models?.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
