export type BusinessSettings = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  website: string;
};

export type PricingRow = {
  label: string;
  value: number;
  unit: string;
};

export type PricingSettings = {
  base: PricingRow[];
  size: PricingRow[];
  region: PricingRow[];
  discounts: PricingRow[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  variables: string[];
  content: string;
};

export type AdminSettingsPayload = {
  business: BusinessSettings;
  pricing: PricingSettings;
  emailTemplates: EmailTemplate[];
};

export type AdminSettingsSection = keyof AdminSettingsPayload;

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  companyName: 'Western Wheelcraft Ltd.',
  address: '3756 Napier St, Burnaby BC V5C 3E5',
  phone: '604.710.6174',
  email: 'info@westernwheelcraft.ca',
  gst: '12345 6789 BC0001',
  website: 'westernwheelcraft.ca',
};

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  base: [
    { label: 'OEM Refinish - Light Damage', value: 300, unit: '$/wheel' },
    { label: 'OEM Refinish - Medium Damage', value: 400, unit: '$/wheel' },
    { label: 'OEM Refinish - Heavy Damage', value: 500, unit: '$/wheel' },
    { label: 'Curb Rash Repair', value: 200, unit: '$' },
    { label: 'Diamond Cut', value: 400, unit: '$/wheel' },
    { label: 'Two-Tone Custom', value: 475, unit: '$/wheel' },
    { label: 'Powder Coat', value: 350, unit: '$/wheel' },
    { label: 'Custom Color Match', value: 50, unit: '+$/wheel' },
    { label: 'Chrome Finish', value: 100, unit: '+$/wheel' },
  ],
  size: [
    { label: '18-19"', value: 25, unit: '+$' },
    { label: '20-21"', value: 50, unit: '+$' },
    { label: '22"+"', value: 75, unit: '+$' },
  ],
  region: [
    { label: 'Lower Mainland Mobile', value: 40, unit: '+$' },
    { label: 'Vancouver Island', value: 60, unit: '+$' },
    { label: 'Okanagan & Interior', value: 80, unit: '+$' },
  ],
  discounts: [
    { label: '4-Wheel Discount', value: 10, unit: '-%' },
    { label: 'Trade Partner', value: 15, unit: '-%' },
  ],
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'quote-sent',
    name: 'Quote Sent',
    description: 'Sent when a quote is emailed to a customer.',
    variables: ['{customer_name}', '{amount}', '{date}'],
    content: `Hi {customer_name},

Thank you for reaching out to Western Wheelcraft! We've prepared a quote for your wheel refinishing service.

Quote Total: {amount}
Valid Until: {date}

To accept this quote or ask any questions, simply reply to this email or give us a call at 604.710.6174.

We look forward to restoring your wheels!

- The Western Wheelcraft Team`,
  },
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    description: 'Sent immediately after a booking is confirmed.',
    variables: ['{customer_name}', '{date}', '{service}'],
    content: `Hi {customer_name},

Your appointment is confirmed! Here's a summary:

Service: {service}
Date & Time: {date}

Please ensure the vehicle is accessible at the scheduled time. If you need to reschedule, contact us at least 24 hours in advance.

See you then!

- Western Wheelcraft`,
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder (24h before)',
    description: 'Automated reminder sent 24 hours before the appointment.',
    variables: ['{customer_name}', '{date}', '{service}'],
    content: `Hi {customer_name},

This is a friendly reminder that your appointment is tomorrow.

Service: {service}
Date & Time: {date}

If you have any questions, reply to this email or call 604.710.6174.

- Western Wheelcraft`,
  },
  {
    id: 'invoice-sent',
    name: 'Invoice Sent',
    description: 'Sent when an invoice is issued to the customer.',
    variables: ['{customer_name}', '{invoice_number}', '{amount}', '{date}'],
    content: `Hi {customer_name},

Please find your invoice attached for the services completed on {date}.

Invoice #: {invoice_number}
Amount Due: {amount}

Payment is due within 14 days. You can pay via e-transfer to info@westernwheelcraft.ca.

Thank you for your business!

- Western Wheelcraft`,
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    description: 'Sent when a payment is recorded for an invoice.',
    variables: ['{customer_name}', '{invoice_number}', '{amount}', '{date}'],
    content: `Hi {customer_name},

We've received your payment - thank you!

Invoice #: {invoice_number}
Amount Paid: {amount}
Payment Date: {date}

Your receipt is attached for your records. We appreciate your prompt payment!

- Western Wheelcraft`,
  },
  {
    id: 'thank-you',
    name: 'Thank You (post-service)',
    description: 'Sent after the service is completed.',
    variables: ['{customer_name}', '{service}', '{date}'],
    content: `Hi {customer_name},

Thank you for choosing Western Wheelcraft! We hope you're loving the results of your {service} completed on {date}.

If you have a moment, we'd greatly appreciate a Google review - it helps our small team grow.

We look forward to serving you again!

- The Western Wheelcraft Team`,
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsPayload = {
  business: DEFAULT_BUSINESS_SETTINGS,
  pricing: DEFAULT_PRICING_SETTINGS,
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
};
