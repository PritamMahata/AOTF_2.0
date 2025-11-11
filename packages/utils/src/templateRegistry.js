import InvoiceTemplate from '@/components/invoice/templates/InvoiceTemplate';

export const templates = [
  { name: 'Template 4', component: InvoiceTemplate },
];

export const getTemplate = () => {
  return templates[0].component; // Always return InvoiceTemplate
};
