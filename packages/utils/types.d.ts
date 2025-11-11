interface InvoiceItem {
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

interface TemplateComponent {
  (props: { data?: Record<string, unknown> }): JSX.Element;
}

interface TemplateRegistryEntry {
  name: string;
  component: TemplateComponent;
}

declare module './src/formatCurrency.js' {
	export function formatCurrency(amount: number, currencyCode?: string, minimumFractionDigits?: number): string;
	export function getCurrencySymbol(currencyCode: string): string;
}

declare module './src/invoiceCalculations.js' {
	export function calculateSubTotal(items: InvoiceItem[]): string;
	export function calculateTaxAmount(subTotal: string, taxPercentage: number): string;
	export function calculateGrandTotal(subTotal: string, taxPercentage: number): string;
}

declare module './src/pdfGenerator.js' {
	export function generatePDF(invoiceData: Record<string, unknown>, templateNumber: number | string): Promise<Blob>;
}

declare module './src/receiptPDFGenerator.js' {
	export function generateReceiptPDF(data: HTMLElement): Promise<void>;
}

declare module './src/templateRegistry.js' {
	export const templates: TemplateRegistryEntry[];
	export function getTemplate(tpl: number | string): TemplateComponent;
}
