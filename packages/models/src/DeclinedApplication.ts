import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeclinedApplication extends Document {
  originalApplicationId: Types.ObjectId;
  postId: Types.ObjectId;
  teacherId: Types.ObjectId;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'withdrawal-requested' | 'withdrawn';
  appliedAt: Date;
  declinedAt: Date;
  declineReason: string;
  autoDeclined: boolean;
  withdrawalRequestedAt?: Date;
  withdrawalRequestedBy?: string;
  withdrawalApprovedAt?: Date;
  withdrawalApprovedBy?: string;
  withdrawalRejectedAt?: Date;
  withdrawalRejectedBy?: string;
  withdrawalNote?: string;
}

const DeclinedApplicationSchema: Schema = new Schema({
  originalApplicationId: { type: Schema.Types.ObjectId, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined', 'completed', 'withdrawal-requested', 'withdrawn'], 
    required: true 
  },
  appliedAt: { type: Date, required: true },
  declinedAt: { type: Date, default: Date.now },
  declineReason: { type: String, required: true },
  autoDeclined: { type: Boolean, default: false },
  withdrawalRequestedAt: { type: Date },
  withdrawalRequestedBy: { type: String },
  withdrawalApprovedAt: { type: Date },
  withdrawalApprovedBy: { type: String },
  withdrawalRejectedAt: { type: Date },
  withdrawalRejectedBy: { type: String },
  withdrawalNote: { type: String, maxlength: 500 },
}, {
  timestamps: true
});

export default mongoose.models?.DeclinedApplication || mongoose.model<IDeclinedApplication>('DeclinedApplication', DeclinedApplicationSchema);
