'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import {
  Camera,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Business Info Tab
// ---------------------------------------------------------------------------

function BusinessInfoTab() {
  const [form, setForm] = useState({
    companyName: 'Western Wheelcraft Ltd.',
    address: '3756 Napier St, Burnaby BC V5C 3E5',
    phone: '604.710.6174',
    email: 'info@westernwheelcraft.ca',
    gst: '12345 6789 BC0001',
    website: 'westernwheelcraft.ca',
  });

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div key={key}>
      <label className="block text-caption font-medium text-brand-silver mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3.5 py-2.5 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/60 focus:outline-none focus:ring-1 focus:ring-brand-red/30 transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {field('Company Name', 'companyName')}
        {field('Phone', 'phone', 'tel')}
        {field('Email', 'email', 'email')}
        {field('GST Number', 'gst')}
        {field('Website', 'website')}
        {field('Address', 'address')}
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-caption font-medium text-brand-silver mb-1.5">
          Company Logo
        </label>
        <button className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-graphite-light bg-brand-graphite/40 py-10 text-brand-silver hover:border-brand-red/40 hover:text-brand-smoke transition-colors">
          <Camera size={28} className="text-brand-ash" />
          <span className="text-body-sm">Click to upload logo</span>
          <span className="text-caption text-brand-ash">PNG, JPG, SVG up to 4 MB</span>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => toast.success('Business info saved')}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing Tab
// ---------------------------------------------------------------------------

type PricingRow = { label: string; value: number; unit: string };

function PricingSection({
  title,
  rows,
  onChange,
}: {
  title: string;
  rows: PricingRow[];
  onChange: (idx: number, value: number) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-body-sm font-semibold text-brand-smoke">
        {title}
      </h3>
      <div className="rounded-xl border border-brand-graphite overflow-hidden">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex items-center gap-4 px-4 py-3 ${idx !== rows.length - 1 ? 'border-b border-brand-graphite/60' : ''}`}
          >
            <span className="flex-1 text-body-sm text-brand-smoke">{row.label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={row.value}
                onChange={(e) => onChange(idx, Number(e.target.value))}
                className="w-24 rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-1.5 text-right font-mono text-body-sm text-brand-white focus:border-brand-red/60 focus:outline-none focus:ring-1 focus:ring-brand-red/30 transition-colors"
              />
              <span className="w-20 text-caption text-brand-silver">{row.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTab() {
  const [base, setBase] = useState<PricingRow[]>([
    { label: 'OEM Refinish – Light Damage', value: 300, unit: '$/wheel' },
    { label: 'OEM Refinish – Medium Damage', value: 400, unit: '$/wheel' },
    { label: 'OEM Refinish – Heavy Damage', value: 500, unit: '$/wheel' },
    { label: 'Curb Rash Repair', value: 200, unit: '$' },
    { label: 'Diamond Cut', value: 400, unit: '$/wheel' },
    { label: 'Two-Tone Custom', value: 475, unit: '$/wheel' },
    { label: 'Powder Coat', value: 350, unit: '$/wheel' },
    { label: 'Custom Color Match', value: 50, unit: '+$/wheel' },
    { label: 'Chrome Finish', value: 100, unit: '+$/wheel' },
  ]);

  const [size, setSize] = useState<PricingRow[]>([
    { label: '18–19"', value: 25, unit: '+$' },
    { label: '20–21"', value: 50, unit: '+$' },
    { label: '22"+"', value: 75, unit: '+$' },
  ]);

  const [region, setRegion] = useState<PricingRow[]>([
    { label: 'Lower Mainland Mobile', value: 40, unit: '+$' },
    { label: 'Vancouver Island', value: 60, unit: '+$' },
    { label: 'Okanagan & Interior', value: 80, unit: '+$' },
  ]);

  const [discounts, setDiscounts] = useState<PricingRow[]>([
    { label: '4-Wheel Discount', value: 10, unit: '-%' },
    { label: 'Trade Partner', value: 15, unit: '-%' },
  ]);

  const update =
    (setter: React.Dispatch<React.SetStateAction<PricingRow[]>>) =>
    (idx: number, value: number) =>
      setter((rows) => rows.map((r, i) => (i === idx ? { ...r, value } : r)));

  return (
    <div className="space-y-6">
      <PricingSection title="Base Prices" rows={base} onChange={update(setBase)} />
      <PricingSection title="Size Premiums" rows={size} onChange={update(setSize)} />
      <PricingSection title="Region Fees" rows={region} onChange={update(setRegion)} />
      <PricingSection title="Discounts" rows={discounts} onChange={update(setDiscounts)} />

      <div className="flex justify-end">
        <button
          onClick={() => toast.success('Pricing updated')}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
        >
          Save Pricing
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team Tab
// ---------------------------------------------------------------------------

type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
};

type AddMemberForm = {
  name: string;
  email: string;
  role: string;
  password: string;
};

function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Tony Smith', role: 'Owner', email: 'tony@westernwheelcraft.ca' },
    { id: 2, name: 'Mike Johnson', role: 'Manager', email: 'mike@westernwheelcraft.ca' },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddMemberForm>({
    name: '',
    email: '',
    role: 'Technician',
    password: '',
  });

  const handleAdd = () => {
    if (!addForm.name || !addForm.email) return;
    setMembers((m) => [
      ...m,
      { id: Date.now(), name: addForm.name, role: addForm.role, email: addForm.email },
    ]);
    setAddForm({ name: '', email: '', role: 'Technician', password: '' });
    setShowAdd(false);
    toast.success('Team member added');
  };

  const handleRemove = (id: number) => {
    setMembers((m) => m.filter((mm) => mm.id !== id));
    toast.success('Member removed (demo)');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-brand-silver">
          {members.length} team member{members.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
        >
          <Plus size={15} />
          Add Team Member
        </button>
      </div>

      {/* Add member form */}
      {showAdd && (
        <div className="rounded-xl border border-brand-graphite-light bg-brand-graphite/40 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-body-sm font-semibold text-brand-white">
              New Team Member
            </h3>
            <button onClick={() => setShowAdd(false)} className="text-brand-silver hover:text-brand-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Password', key: 'password', type: 'password' },
              ] as { label: string; key: keyof AddMemberForm; type: string }[]
            ).map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-caption font-medium text-brand-silver mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={addForm[key]}
                  onChange={(e) => setAddForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3.5 py-2.5 text-body-sm text-brand-white focus:border-brand-red/60 focus:outline-none focus:ring-1 focus:ring-brand-red/30 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-caption font-medium text-brand-silver mb-1.5">
                Role
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3.5 py-2.5 text-body-sm text-brand-white focus:border-brand-red/60 focus:outline-none focus:ring-1 focus:ring-brand-red/30 transition-colors"
              >
                <option>Owner</option>
                <option>Manager</option>
                <option>Technician</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-silver hover:text-brand-white hover:border-brand-graphite-light transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Members table */}
      <div className="rounded-xl border border-brand-graphite overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-graphite bg-brand-graphite/40">
              <th className="px-4 py-3 text-left text-caption font-semibold text-brand-silver">
                Name
              </th>
              <th className="px-4 py-3 text-left text-caption font-semibold text-brand-silver">
                Role
              </th>
              <th className="px-4 py-3 text-left text-caption font-semibold text-brand-silver hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-right text-caption font-semibold text-brand-silver">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-graphite/60">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-brand-graphite/20 transition-colors">
                <td className="px-4 py-3.5 text-body-sm font-medium text-brand-white">
                  {m.name}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full bg-brand-graphite-light px-2.5 py-0.5 text-caption text-brand-smoke">
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-body-sm text-brand-silver hidden sm:table-cell">
                  {m.email}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toast.info('Edit member (demo)')}
                      className="flex items-center gap-1 rounded-md border border-brand-graphite px-2.5 py-1 text-caption text-brand-silver hover:text-brand-white hover:border-brand-graphite-light transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="flex items-center gap-1 rounded-md border border-red-900/40 px-2.5 py-1 text-caption text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email Templates Tab
// ---------------------------------------------------------------------------

type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  variables: string[];
  content: string;
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
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

– The Western Wheelcraft Team`,
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

– Western Wheelcraft`,
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

– Western Wheelcraft`,
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

– Western Wheelcraft`,
  },
  {
    id: 'payment-received',
    name: 'Payment Received',
    description: 'Sent when a payment is recorded for an invoice.',
    variables: ['{customer_name}', '{invoice_number}', '{amount}', '{date}'],
    content: `Hi {customer_name},

We've received your payment — thank you!

Invoice #: {invoice_number}
Amount Paid: {amount}
Payment Date: {date}

Your receipt is attached for your records. We appreciate your prompt payment!

– Western Wheelcraft`,
  },
  {
    id: 'thank-you',
    name: 'Thank You (post-service)',
    description: 'Sent after the service is completed.',
    variables: ['{customer_name}', '{service}', '{date}'],
    content: `Hi {customer_name},

Thank you for choosing Western Wheelcraft! We hope you're loving the results of your {service} completed on {date}.

If you have a moment, we'd greatly appreciate a Google review — it helps our small team grow.

We look forward to serving you again!

– The Western Wheelcraft Team`,
  },
];

function EmailTemplateRow({ template }: { template: EmailTemplate }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(template.content);

  return (
    <div className="rounded-xl border border-brand-graphite overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-brand-graphite/20 transition-colors"
      >
        <div className="text-left">
          <p className="text-body-sm font-semibold text-brand-white">{template.name}</p>
          <p className="mt-0.5 text-caption text-brand-silver">{template.description}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-brand-silver" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-brand-silver" />
        )}
      </button>

      {open && (
        <div className="border-t border-brand-graphite px-5 pb-5 pt-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3.5 py-3 font-mono text-caption text-brand-smoke leading-relaxed focus:border-brand-red/60 focus:outline-none focus:ring-1 focus:ring-brand-red/30 transition-colors resize-y"
          />
          <div className="flex flex-wrap gap-2">
            {template.variables.map((v) => (
              <span
                key={v}
                className="rounded-md bg-brand-graphite-light px-2.5 py-1 font-mono text-caption text-brand-red"
              >
                {v}
              </span>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => toast.success('Template saved')}
              className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailTemplatesTab() {
  return (
    <div className="space-y-3">
      {DEFAULT_TEMPLATES.map((t) => (
        <EmailTemplateRow key={t.id} template={t} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integrations Tab
// ---------------------------------------------------------------------------

type Integration = {
  id: string;
  name: string;
  connected: boolean;
  description: string;
};

const INTEGRATIONS: Integration[] = [
  { id: 'stripe', name: 'Stripe', connected: true, description: 'Payment processing active' },
  { id: 'resend', name: 'Resend (Email)', connected: true, description: 'Email delivery active' },
  { id: 'twilio', name: 'Twilio (SMS)', connected: true, description: 'SMS notifications active' },
  {
    id: 'gcal',
    name: 'Google Calendar',
    connected: false,
    description: 'Sync bookings to Google Calendar',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    connected: false,
    description: 'Sync invoices to accounting',
  },
  {
    id: 'stripe-atlas',
    name: 'Stripe Atlas',
    connected: false,
    description: 'Corporate card management',
  },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  const [connected, setConnected] = useState(integration.connected);

  const toggle = () => {
    setConnected((c) => !c);
    if (connected) {
      toast.success('Integration disconnected (demo)');
    } else {
      toast.success('Integration connected (demo)');
    }
  };

  return (
    <div className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-body-sm font-semibold text-brand-white">
            {integration.name}
          </p>
          <p className="mt-1 text-caption text-brand-silver">{integration.description}</p>
        </div>
        {connected ? (
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-400" />
        ) : (
          <Circle size={18} className="shrink-0 mt-0.5 text-brand-ash" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${
            connected
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-brand-graphite text-brand-silver border border-brand-graphite-light'
          }`}
        >
          {connected ? 'Connected' : 'Not Connected'}
        </span>
        <button
          onClick={toggle}
          className={`rounded-lg px-3.5 py-1.5 text-caption font-semibold transition-colors ${
            connected
              ? 'border border-brand-graphite text-brand-silver hover:text-brand-white hover:border-brand-graphite-light'
              : 'bg-brand-red text-brand-white hover:bg-brand-red-hover'
          }`}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {INTEGRATIONS.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

const TABS = [
  { value: 'business', label: 'Business Info' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'team', label: 'Team' },
  { value: 'email', label: 'Email Templates' },
  { value: 'integrations', label: 'Integrations' },
] as const;

export default function SettingsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-brand-white">Settings</h1>
        <p className="mt-1 text-body-sm text-brand-silver">
          Manage your business configuration and preferences.
        </p>
      </div>

      <Tabs.Root defaultValue="business">
        {/* Tab list */}
        <Tabs.List className="flex gap-1 border-b border-brand-graphite mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 px-4 py-2.5 text-body-sm text-brand-silver border-b-2 border-transparent -mb-px hover:text-brand-smoke transition-colors data-[state=active]:text-brand-white data-[state=active]:border-brand-red focus:outline-none"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="business">
          <BusinessInfoTab />
        </Tabs.Content>

        <Tabs.Content value="pricing">
          <PricingTab />
        </Tabs.Content>

        <Tabs.Content value="team">
          <TeamTab />
        </Tabs.Content>

        <Tabs.Content value="email">
          <EmailTemplatesTab />
        </Tabs.Content>

        <Tabs.Content value="integrations">
          <IntegrationsTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
