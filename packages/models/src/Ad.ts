import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAd extends Document {
  title: string;
  imageUrl: string;
  link: string;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  startDate?: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  updateStatusBasedOnTime(): boolean;
}

export interface IAdModel extends Model<IAd> {
  updateAllAdStatuses(): Promise<void>;
}

const AdSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    link: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'expired', 'scheduled'], default: 'active' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual to check if ad is expired
AdSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
});

// Method to check and update ad status based on server time
AdSchema.methods.updateStatusBasedOnTime = function() {
  const now = new Date();
  
  // If ad has expired
  if (this.endDate && now > this.endDate) {
    if (this.status !== 'expired') {
      this.status = 'expired';
      return true;
    }
  }
  // If ad should be active now but was scheduled
  else if (this.startDate && now >= this.startDate && this.status === 'scheduled') {
    // Check if endDate hasn't passed
    if (!this.endDate || now <= this.endDate) {
      this.status = 'active';
      return true;
    }
  }
  // If ad should be scheduled (start date in future)
  else if (this.startDate && now < this.startDate && this.status === 'active') {
    this.status = 'scheduled';
    return true;
  }
  
  return false;
};

// Static method to update all ads status based on server time
AdSchema.statics.updateAllAdStatuses = async function() {
  const now = new Date();
  
  // Expire ads that have passed their end date
  await this.updateMany(
    { 
      endDate: { $lt: now },
      status: { $nin: ['expired', 'inactive'] }
    },
    { $set: { status: 'expired' } }
  );
  
  // Activate scheduled ads that have reached their start date
  await this.updateMany(
    {
      startDate: { $lte: now },
      status: 'scheduled',
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    },
    { $set: { status: 'active' } }
  );
  
  // Schedule active ads that haven't reached their start date yet
  await this.updateMany(
    {
      startDate: { $gt: now },
      status: 'active'
    },
    { $set: { status: 'scheduled' } }
  );
};

// Export the model with proper typing
const AdModel = (mongoose.models?.Ad as IAdModel) || mongoose.model<IAd, IAdModel>('Ad', AdSchema);

export default AdModel;
