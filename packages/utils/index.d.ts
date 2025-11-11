export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  amount: number;
  total?: number;
  postDetails?: {
    postId?: string;
    preferredTime?: string;
    preferredDays?: string[];
    location?: string;
  };
}

export declare function formatCurrency(amount: number, currencyCode?: string, minimumFractionDigits?: number): string;
export declare function getCurrencySymbol(currencyCode: string): string;
export declare function calculateSubTotal(items: InvoiceItem[]): string;
export declare function calculateTaxAmount(subTotal: string, taxPercentage: number): string;
export declare function calculateGrandTotal(subTotal: string, taxPercentage: number): string;
export declare function generatePDF(invoiceData: Record<string, unknown>, templateNumber: number | string): Promise<Blob>;
