import mongoose, { Schema, Document } from 'mongoose';

export interface IAdAnalytics extends Document {
  adId: mongoose.Types.ObjectId;
  date: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdAnalyticsSchema: Schema = new Schema(
  {
    adId: { type: Schema.Types.ObjectId, ref: 'Ad', required: true, index: true },
    date: { type: Date, required: true, index: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for efficient queries
AdAnalyticsSchema.index({ adId: 1, date: 1 }, { unique: true });

export default mongoose.models?.AdAnalytics || mongoose.model<IAdAnalytics>('AdAnalytics', AdAnalyticsSchema);
