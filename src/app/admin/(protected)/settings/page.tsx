'use client';

import { useEffect, useState } from 'react';
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
import {
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettingsPayload,
  type AdminSettingsSection,
  type BusinessSettings,
  type EmailTemplate,
  type PricingRow,
  type PricingSettings,
} from '@/lib/admin-settings-data';

// ---------------------------------------------------------------------------
// Business Info Tab
// ---------------------------------------------------------------------------

function BusinessInfoTab({
  value,
  saving,
  onSave,
}: {
  value: BusinessSettings;
  saving: boolean;
  onSave: (value: BusinessSettings) => Promise<void>;
}) {
  const [form, setForm] = useState(value);

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
          onClick={() => void onSave(form)}
          disabled={saving}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing Tab
// ---------------------------------------------------------------------------

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

function PricingTab({
  value,
  saving,
  onSave,
}: {
  value: PricingSettings;
  saving: boolean;
  onSave: (value: PricingSettings) => Promise<void>;
}) {
  const [base, setBase] = useState<PricingRow[]>(value.base);
  const [size, setSize] = useState<PricingRow[]>(value.size);
  const [region, setRegion] = useState<PricingRow[]>(value.region);
  const [discounts, setDiscounts] = useState<PricingRow[]>(value.discounts);

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
          onClick={() => void onSave({ base, size, region, discounts })}
          disabled={saving}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
        >
          {saving ? 'Saving...' : 'Save Pricing'}
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
    role: 'Manager',
    password: '',
  });

  const handleAdd = () => {
    if (!addForm.name || !addForm.email) return;
    setMembers((m) => [
      ...m,
      { id: Date.now(), name: addForm.name, role: addForm.role, email: addForm.email },
    ]);
    setAddForm({ name: '', email: '', role: 'Manager', password: '' });
    setShowAdd(false);
    toast.success('Team member added');
  };

  const handleRemove = (id: number) => {
    setMembers((m) => m.filter((mm) => mm.id !== id));
    toast.success('Member removed');
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
                <option>Accountant</option>
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
                      onClick={() => toast.info('Role editing will be connected to Clerk user metadata in a later phase')}
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

function EmailTemplateRow({
  template,
  saving,
  onSave,
}: {
  template: EmailTemplate;
  saving: boolean;
  onSave: (template: EmailTemplate) => Promise<void>;
}) {
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
              onClick={() => void onSave({ ...template, content })}
              disabled={saving}
              className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailTemplatesTab({
  value,
  saving,
  onSave,
}: {
  value: EmailTemplate[];
  saving: boolean;
  onSave: (value: EmailTemplate[]) => Promise<void>;
}) {
  const saveTemplate = async (template: EmailTemplate) => {
    await onSave(value.map((item) => (item.id === template.id ? template : item)));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-body-sm font-semibold text-amber-200">
          Transactional email delivery is connected when Resend environment variables are configured.
        </p>
        <p className="mt-1 text-caption text-amber-100/80">
          These templates remain draft content until template-driven sending is added to the production email workflow.
        </p>
      </div>
      {value.map((t) => (
        <EmailTemplateRow key={t.id} template={t} saving={saving} onSave={saveTemplate} />
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
  status: string;
};

const INTEGRATIONS: Integration[] = [
  {
    id: 'neon',
    name: 'Neon Postgres',
    connected: true,
    status: 'Connected',
    description: 'Quote, booking, lead, and customer records are saving to the production database.',
  },
  {
    id: 'clerk',
    name: 'Clerk Admin Auth',
    connected: true,
    status: 'Connected',
    description: 'Admin routes are protected with Clerk and role checks for owner, manager, and accountant.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    connected: false,
    status: 'Implementation pending',
    description: 'Payment and deposit flow still needs the real Stripe checkout/webhook implementation.',
  },
  {
    id: 'resend',
    name: 'Resend (Email)',
    connected: true,
    status: 'Transactional sending ready',
    description: 'Contact, quote, and booking notifications send through Resend when production environment variables are configured.',
  },
  {
    id: 'openai',
    name: 'OpenAI Vision',
    connected: false,
    status: 'Implementation pending',
    description: 'Damage assessment still needs real image storage and Vision API processing.',
  },
  {
    id: 'storage',
    name: 'Photo Storage',
    connected: false,
    status: 'Implementation pending',
    description: 'Uploaded wheel photos are not persisted to production object storage yet.',
  },
  {
    id: 'twilio',
    name: 'Twilio (SMS)',
    connected: false,
    status: 'Future optional',
    description: 'SMS notifications are not part of the current production path.',
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    connected: false,
    status: 'Future optional',
    description: 'Calendar sync can be added after core booking and email flows are live.',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    connected: false,
    status: 'Future optional',
    description: 'Accounting sync should wait until invoices/payments are production-ready.',
  },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-body-sm font-semibold text-brand-white">
            {integration.name}
          </p>
          <p className="mt-1 text-caption text-brand-silver">{integration.description}</p>
        </div>
        {integration.connected ? (
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-400" />
        ) : (
          <Circle size={18} className="shrink-0 mt-0.5 text-brand-ash" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${
            integration.connected
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-brand-graphite text-brand-silver border border-brand-graphite-light'
          }`}
        >
          {integration.status}
        </span>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 px-4 py-3">
        <p className="text-body-sm font-semibold text-brand-white">
          Production status only
        </p>
        <p className="mt-1 text-caption text-brand-silver">
          These cards reflect systems with real production code paths. API keys alone are not marked as connected.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
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

type SavingSection = AdminSettingsSection | null;

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsPayload>(DEFAULT_ADMIN_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SavingSection>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load admin settings.');
        const payload = (await response.json()) as { settings: AdminSettingsPayload };
        if (mounted) setSettings(payload.settings);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load saved settings. Showing defaults.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const saveSetting = async <TSection extends AdminSettingsSection>(
    section: TSection,
    value: AdminSettingsPayload[TSection]
  ) => {
    setSavingSection(section);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, value }),
      });

      if (!response.ok) throw new Error('Unable to save admin settings.');
      const payload = (await response.json()) as { settings: AdminSettingsPayload };
      setSettings(payload.settings);
      toast.success('Settings saved to Neon');
    } catch (error) {
      console.error(error);
      toast.error('Unable to save settings');
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-brand-white">Settings</h1>
        <p className="mt-1 text-body-sm text-brand-silver">
          {loading
            ? 'Loading saved business configuration from Neon...'
            : 'Manage your business configuration and preferences.'}
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
          <BusinessInfoTab
            key={JSON.stringify(settings.business)}
            value={settings.business}
            saving={savingSection === 'business'}
            onSave={(value) => saveSetting('business', value)}
          />
        </Tabs.Content>

        <Tabs.Content value="pricing">
          <PricingTab
            key={JSON.stringify(settings.pricing)}
            value={settings.pricing}
            saving={savingSection === 'pricing'}
            onSave={(value) => saveSetting('pricing', value)}
          />
        </Tabs.Content>

        <Tabs.Content value="team">
          <TeamTab />
        </Tabs.Content>

        <Tabs.Content value="email">
          <EmailTemplatesTab
            key={JSON.stringify(settings.emailTemplates)}
            value={settings.emailTemplates}
            saving={savingSection === 'emailTemplates'}
            onSave={(value) => saveSetting('emailTemplates', value)}
          />
        </Tabs.Content>

        <Tabs.Content value="integrations">
          <IntegrationsTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
