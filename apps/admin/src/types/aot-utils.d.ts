declare module '@aotf/utils' {
  export function formatCurrency(amount: number, currencyCode?: string, minimumFractionDigits?: number): string;
  export function generatePDF(invoiceData: unknown, templateNumber: number): Promise<Buffer>;
}
