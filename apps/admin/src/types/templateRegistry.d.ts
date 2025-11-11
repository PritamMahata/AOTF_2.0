import type { ComponentType } from 'react';

declare module '@/utils/templateRegistry' {
  interface InvoiceContact {
    name?: string;
    address?: string;
    phone?: string;
  }

  interface InvoiceDetails {
    number?: string;
    date?: string | Date;
    paymentDate?: string | Date;
  }

  interface InvoicePostDetails {
    preferredTime?: string;
    preferredDays?: string[];
    location?: string;
    postId?: string;
  }

  interface InvoiceItem {
    name?: string;
    description?: string;
    amount?: number;
    postDetails?: InvoicePostDetails;
  }

  interface InvoiceTemplateData {
    billTo?: InvoiceContact;
    invoice?: InvoiceDetails;
    yourCompany?: InvoiceContact;
    items?: InvoiceItem[];
    taxPercentage?: number;
    taxAmount?: number;
    subTotal?: number;
    grandTotal?: number;
    notes?: string;
    selectedCurrency?: string;
    signature?: string;
    websiteUrl?: string;
    paymentStatus?: 'paid' | 'unpaid';
  }

  type TemplateComponent = ComponentType<{ data?: InvoiceTemplateData }>;

  interface TemplateRegistryEntry {
    name: string;
    component: TemplateComponent;
  }

  export const templates: TemplateRegistryEntry[];
  export function getTemplate(): TemplateComponent;
}
