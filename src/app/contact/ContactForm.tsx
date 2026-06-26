'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface FormState {
  name: string;
  email: string;
  phone: string;
  region: string;
  service: string;
  message: string;
}

const regions = [
  { value: 'lower-mainland', label: 'Lower Mainland — Shop Drop-Off' },
  { value: 'vancouver-island', label: 'Vancouver Island — Mobile Fleet' },
  { value: 'okanagan', label: 'Okanagan — Mobile Fleet' },
  { value: 'kelowna', label: 'Kelowna — Mobile Fleet' },
  { value: 'kamloops', label: 'Kamloops — Mobile Fleet' },
];

const services = [
  { value: 'curb-rash', label: 'Curb Rash Repair' },
  { value: 'oem-colour', label: 'OEM Color Matching' },
  { value: 'diamond-cut', label: 'Diamond Cut Refinishing' },
  { value: 'custom-finish', label: 'Custom Finish' },
  { value: 'caliper-painting', label: 'Caliper Painting' },
  { value: 'full-restore', label: 'Full Restoration' },
  { value: 'other', label: 'Other / Not Sure' },
];

const inputClass =
  'w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver/60 outline-none transition-all duration-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20';

const labelClass = 'mb-1.5 block font-body text-body-sm font-semibold text-brand-smoke';

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', region: '', service: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'contact_form',
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone || undefined,
          region: form.region || undefined,
          requestedService: form.service || undefined,
          damageDescription: form.message || undefined,
          marketingConsent: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to save contact request.');
      }

      setLoading(false);
      setSubmitted(true);
    } catch {
      setLoading(false);
      setError('We could not save your request. Please try again or call us directly.');
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-success/30 bg-success/10 px-8 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
          <IconCheck />
        </div>
        <h3 className="mb-2 font-display text-display-sm text-brand-white">Message Sent!</h3>
        <p className="font-body text-body-md text-brand-smoke">
          Thanks, {form.name.split(' ')[0]}. We&rsquo;ll review your request and get back to
          you within a few hours — usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="John Smith"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="604-555-0100"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="region" className={labelClass}>Your Region *</label>
        <select
          id="region"
          name="region"
          required
          value={form.region}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="" disabled>Select your region…</option>
          {regions.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="service" className={labelClass}>Service Needed</label>
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="" disabled>Select a service…</option>
          {services.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message / Damage Description</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Describe the damage or what you're looking for — photos can be emailed separately to info@westernwheelcraft.ca"
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full justify-center">
        Send Message
      </Button>

      {error && (
        <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-center font-body text-body-sm text-brand-red">
          {error}
        </p>
      )}

      <p className="text-center font-body text-caption text-brand-silver">
        Or call us directly at{' '}
        <a href="tel:+16047106174" className="text-brand-smoke hover:text-brand-red transition-colors">
          604.710.6174
        </a>
      </p>
    </form>
  );
}
