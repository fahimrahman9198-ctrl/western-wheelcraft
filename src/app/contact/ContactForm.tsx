'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

// Mirrors the server limits in lib/quote-persistence.ts so the user gets
// feedback before uploading rather than a rejection after.
const MAX_PHOTOS = 8;
const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  region: string;
  service: string;
  message: string;
  /** Honeypot — hidden from users, so any value means a bot filled it. */
  website: string;
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

function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', region: '', service: '', message: '', website: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Object URLs are only revoked on unmount; addPhotos/removePhoto rebuild the
  // list, so revoking there would invalidate previews still on screen.
  useEffect(() => {
    return () => photoUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [photoUrls]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addPhotos(fileList: FileList) {
    setPhotoError('');
    const incoming = Array.from(fileList);

    const rejected: string[] = [];
    const accepted = incoming.filter((file) => {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        rejected.push(`${file.name} is not a JPG, PNG, WEBP, or HEIC image`);
        return false;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        rejected.push(`${file.name} is larger than 8 MB`);
        return false;
      }
      return true;
    });

    setPhotos((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_PHOTOS) {
        rejected.push(`Only the first ${MAX_PHOTOS} photos were kept`);
      }
      const capped = combined.slice(0, MAX_PHOTOS);
      setPhotoUrls(capped.map((file) => URL.createObjectURL(file)));
      return capped;
    });

    if (rejected.length > 0) setPhotoError(rejected.join('. ') + '.');

    // Reset so re-selecting the same file still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    setPhotoError('');
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setPhotoUrls(next.map((file) => URL.createObjectURL(file)));
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      source: 'contact_form',
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone || undefined,
      region: form.region || undefined,
      requestedService: form.service || undefined,
      damageDescription: form.message || undefined,
      marketingConsent: false,
      website: form.website || undefined,
    };

    try {
      let response: Response;

      if (photos.length > 0) {
        // Multipart carries the JSON payload alongside the files; the route
        // reads the "payload" field and any number of "photos" entries.
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        photos.forEach((photo) => formData.append('photos', photo));
        response = await fetch('/api/quotes', { method: 'POST', body: formData });
      } else {
        response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Unable to save contact request.');
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error && err.message !== 'Unable to save contact request.'
          ? err.message
          : 'We could not save your request. Please try again or call us directly.'
      );
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
      {/*
        Honeypot. Moved off-screen rather than display:none, since some bots
        skip fields they can tell are hidden. aria-hidden and tabIndex keep it
        away from screen readers and keyboard navigation.
      */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave blank)</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

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
          placeholder="Describe the damage or what you're looking for"
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label htmlFor="photos" className={labelClass}>
          Photos <span className="font-normal text-brand-silver">(optional — up to {MAX_PHOTOS})</span>
        </label>

        <input
          ref={fileInputRef}
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && addPhotos(e.target.files)}
        />

        <label
          htmlFor="photos"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-ash bg-brand-graphite px-4 py-6 text-center transition-colors duration-200 hover:border-brand-red"
        >
          <span className="text-brand-red">
            <IconCamera />
          </span>
          <span className="font-body text-body-sm font-semibold text-brand-white">
            {photos.length > 0 ? 'Add more photos' : 'Add photos of your wheels'}
          </span>
          <span className="font-body text-caption text-brand-silver">
            JPG, PNG, WEBP or HEIC · max 8 MB each
          </span>
        </label>

        {photos.length > 0 && (
          <>
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((photo, i) => (
                <li key={`${photo.name}-${i}`} className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-brand-ash bg-brand-graphite">
                    <Image
                      src={photoUrls[i]}
                      alt={`Uploaded photo ${i + 1}: ${photo.name}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove ${photo.name}`}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-red text-white shadow-sm transition-transform duration-200 hover:scale-110"
                  >
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-body text-caption text-brand-silver">
              {photos.length} of {MAX_PHOTOS} photo{photos.length !== 1 ? 's' : ''} attached
            </p>
          </>
        )}

        {photoError && (
          <p className="mt-2 font-body text-caption text-brand-red">{photoError}</p>
        )}
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
