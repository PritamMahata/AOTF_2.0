import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoiceItem {
  name: string;
  description: string;
  quantity: number;
  amount: number;
  total: number;
  postDetails?: {
    postId?: string;
    preferredTime?: string;
    preferredDays?: string[];
    location?: string;
  };
}

export interface ICompanyInfo {
  name: string;
  address: string;
  phone: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string; // Unique alphanumeric invoice number (max 6 chars)
  invoiceDate: Date;
  paymentDate: Date;
  paymentStatus: 'paid' | 'unpaid';
  
  // Company Information
  yourCompany: ICompanyInfo;
  
  // Client Information
  billTo: ICompanyInfo;
  shipTo: ICompanyInfo;
  
  // Items and Pricing
  items: IInvoiceItem[];
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  
  // Additional Information
  notes: string;
  currency: string;
  signature: string;
  websiteUrl: string;
  
  // Metadata
  postId?: string; // If linked to a specific post
  createdBy?: Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
  
  // PDF Storage (optional)
  pdfUrl?: string; // If we store PDFs in cloud storage
}

const InvoiceItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  amount: { type: Number, required: true },
  total: { type: Number, required: true },
  postDetails: {
    postId: String,
    preferredTime: String,
    preferredDays: [String],
    location: String,
  },
}, { _id: false });

const CompanyInfoSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20, // Increased to accommodate longer invoice numbers
  },
  invoiceDate: { type: Date, required: true },
  paymentDate: { type: Date, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'unpaid'], 
    default: 'unpaid' 
  },
  
  yourCompany: { type: CompanyInfoSchema, required: true },
  billTo: { type: CompanyInfoSchema, required: true },
  shipTo: { type: CompanyInfoSchema, required: true },
  
  items: { type: [InvoiceItemSchema], required: true },
  subTotal: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  notes: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  signature: { type: String, default: '/sign.png' },
  websiteUrl: { type: String },
  
  postId: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  
  pdfUrl: { type: String },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Index for faster queries
// Note: invoiceNumber index is already created by the 'unique: true' option above
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ postId: 1 });
InvoiceSchema.index({ paymentStatus: 1 });

export default mongoose.models?.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
