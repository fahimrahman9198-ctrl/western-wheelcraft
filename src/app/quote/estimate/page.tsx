'use client';

import { useState, useCallback, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { calcFixedWheelPricing } from '@/lib/payment-utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  wheelSize: string;
  currentFinish: string;
  region: string;
  wheelCount: number;
}

interface FinishSelection {
  type: string;
  customColor: string;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  otherCity: string;
  marketingConsent: boolean;
  contactConsent: boolean;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const MAKES = [
  'Alfa Romeo', 'Audi', 'Bentley', 'BMW', 'Cadillac', 'Chevrolet',
  'Dodge', 'Ferrari', 'Ford', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln',
  'Maserati', 'McLaren', 'Mercedes-Benz', 'Porsche', 'Range Rover',
  'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

const WHEEL_SIZES = ['16"', '17"', '18"', '19"', '20"', '21"', '22"+'];

const CURRENT_FINISHES = [
  'Factory Paint', 'Chrome', 'Two-Tone', 'Diamond Cut',
];

const REGIONS = [
  { value: 'lm-shop',    label: 'Lower Mainland — Shop Drop-Off',   fee: 0  },
  { value: 'lm-express', label: 'Lower Mainland — Express Mobile',  fee: 25 },
  { value: 'lm-mobile',  label: 'Lower Mainland — Mobile Service',  fee: 40 },
  { value: 'vi',         label: 'Vancouver Island',                  fee: 60 },
  { value: 'interior',   label: 'Okanagan & Interior BC',            fee: 80 },
];

const FINISHES = [
  { value: 'oem',      label: 'OEM Color Match', description: 'Factory-accurate spectrophotometer match', premium: 50  },
  { value: 'custom',   label: 'Custom Color',    description: 'Any colour of your choosing',              premium: 0   },
  { value: 'chrome',   label: 'Chrome',          description: 'High-gloss mirror chrome finish',          premium: 100 },
  { value: 'caliper',  label: 'Caliper Painting', description: 'Custom brake caliper colour, any shade',  premium: 0   },
  { value: 'two-tone', label: 'Two-Tone',        description: 'Dual-colour accent design',               premium: 75  },
];

const LOCATION_GROUPS = [
  {
    group: 'Lower Mainland',
    cities: ['Vancouver', 'Burnaby', 'Surrey', 'Richmond', 'Coquitlam', 'Port Coquitlam',
             'Langley', 'North Vancouver', 'West Vancouver', 'Delta', 'New Westminster',
             'Abbotsford', 'White Rock', 'Pitt Meadows', 'Maple Ridge'],
  },
  {
    group: 'Vancouver Island',
    cities: ['Victoria', 'Nanaimo', 'Duncan', 'Langford', 'Courtenay'],
  },
  {
    group: 'Okanagan & Interior',
    cities: ['Kelowna', 'Penticton', 'Vernon', 'West Kelowna', 'Kamloops'],
  },
];

const STEP_LABELS = [
  'Upload Photos',
  'Vehicle Info',
  'Wheel Count',
  'Select Finish',
  'Your Details',
  'Your Quote',
];

const TOTAL_STEPS = 6;
const MAX_PHOTOS = 8;

// ── Pricing helpers ───────────────────────────────────────────────────────────

function sizePremium(size: string): number {
  if (size === '18"' || size === '19"') return 25;
  if (size === '20"' || size === '21"') return 50;
  if (size === '22"+') return 75;
  return 0;
}


function getRegionFee(region: string): number {
  return REGIONS.find(r => r.value === region)?.fee ?? 0;
}

function getFinishPremium(type: string): number {
  return FINISHES.find(f => f.value === type)?.premium ?? 0;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Animation variants ────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

const transition = { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const };

// ── Icons ────────────────────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function StepHeading({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="mb-1.5 font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
        Step {step} of {TOTAL_STEPS}
      </p>
      <h1 className="mb-2 font-display text-display-sm md:text-display-md text-brand-white">{title}</h1>
      {subtitle && <p className="font-body text-body-md text-brand-smoke">{subtitle}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, children,
}: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-body-sm font-semibold text-brand-white">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors duration-200 pr-10"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver">
          <IconChevronDown />
        </span>
      </div>
    </div>
  );
}

function TextField({
  label, value, onChange, placeholder, type = 'text', icon, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-body-sm font-semibold text-brand-white">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-silver">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:outline-none focus:ring-1 transition-colors duration-200',
            icon && 'pl-10',
            error
              ? 'border-brand-red focus:border-brand-red focus:ring-brand-red'
              : 'border-brand-ash focus:border-brand-red focus:ring-brand-red'
          )}
        />
      </div>
      {error && <p className="font-body text-caption text-brand-red">{error}</p>}
    </div>
  );
}

function NavButtons({
  onBack, onNext, nextLabel = 'Continue', nextDisabled = false, nextLoading = false,
}: {
  onBack?: () => void; onNext: () => void; nextLabel?: string;
  nextDisabled?: boolean; nextLoading?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center gap-4">
      {onBack && (
        <Button variant="secondary" size="md" onClick={onBack}>
          Back
        </Button>
      )}
      <Button
        variant="primary"
        size="md"
        onClick={onNext}
        disabled={nextDisabled}
        loading={nextLoading}
        rightIcon={!nextLoading ? <IconArrowRight /> : undefined}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

// ── Damage level helpers ─────────────────────────────────────────────────────


// ── Main Page ────────────────────────────────────────────────────────────────

export default function EstimatePage() {
  const router = useRouter();
  const [step, setStep]           = useState(1);
  const [dir, setDir]             = useState(1);
  const [photos, setPhotos]       = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [vehicle, setVehicle]     = useState<VehicleInfo>({
    year: '2022', make: '', model: '', wheelSize: '19"',
    currentFinish: 'Factory Paint', region: 'lm-shop', wheelCount: 4,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [finish, setFinish]       = useState<FinishSelection>({ type: 'oem', customColor: '#D81E2A' });
  const [contact, setContact]     = useState<ContactInfo>({
    fullName: '', email: '', phone: '', location: '', otherCity: '',
    marketingConsent: false, contactConsent: false,
  });
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({});
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [savedQuoteNumber, setSavedQuoteNumber] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  // ── Photo handling ──

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    setPhotos(prev => {
      const combined = [...prev, ...arr].slice(0, MAX_PHOTOS);
      setPhotoUrls(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  }, []);

  const removePhoto = (i: number) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      setPhotoUrls(next.map(f => URL.createObjectURL(f)));
      return next;
    });
  };

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Vehicle make autocomplete ──

  const onMakeChange = (val: string) => {
    setVehicle(v => ({ ...v, make: val }));
    const filtered = val.length > 0
      ? MAKES.filter(m => m.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
      : [];
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // ── Wheel count (no AI analysis) ──

  const updateWheelCount = useCallback((count: number) => {
    setVehicle(v => ({ ...v, wheelCount: count }));
  }, []);

  // ── Contact validation ──

  function validateContact(): boolean {
    const errors: Partial<Record<keyof ContactInfo, string>> = {};
    if (!contact.fullName.trim()) errors.fullName = 'Full name is required';
    else if (contact.fullName.trim().length < 2) errors.fullName = 'Please enter your full name (at least 2 characters)';
    if (!contact.email.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(contact.email)) errors.email = 'Enter a valid email address';
    if (!contact.phone.trim()) errors.phone = 'Phone number is required';
    else if (contact.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a 10-digit phone number';
    if (!contact.location) errors.location = 'Please select your city/region';
    if (contact.location === 'other' && !contact.otherCity.trim()) errors.otherCity = 'Please enter your city';
    if (!contact.contactConsent) errors.contactConsent = 'You must agree to be contacted about your quote';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function selectedLocation(): string {
    return contact.location === 'other' ? contact.otherCity : contact.location;
  }

  async function saveEstimatorLead(): Promise<boolean> {
    if (savedQuoteNumber) return true;

    setQuoteSubmitting(true);
    setQuoteError('');

    try {
      if (photos.length < 1) {
        throw new Error('At least one wheel photo is required.');
      }

      const pricing = calcFixedWheelPricing(vehicle.wheelCount);
      const payload = {
        source: 'estimator',
        customerName: contact.fullName,
        customerEmail: contact.email,
        customerPhone: contact.phone || undefined,
        region: selectedLocation() || vehicle.region,
        marketingConsent: contact.marketingConsent,
        vehicleYear: Number(vehicle.year) || undefined,
        vehicleMake: vehicle.make || undefined,
        vehicleModel: vehicle.model || undefined,
        wheelSize: vehicle.wheelSize,
        currentFinish: vehicle.currentFinish,
        requestedService: 'Wheel refinishing',
        requestedFinish: FINISHES.find(f => f.value === finish.type)?.label ?? finish.type,
        wheelCount: vehicle.wheelCount,
        damageDescription: `${vehicle.wheelCount} wheels selected for refinishing. Photos and details saved for technician review.`,
        estimatedSubtotal: pricing.subtotal,
        estimatedGst: pricing.gst,
        estimatedTotal: pricing.total,
        pricingSnapshot: {
          vehicle,
          finish,
          pricing,
          selectedLocation: selectedLocation(),
          selectedPhotoCount: photos.length,
        },
      };

      // Upload photos directly to Blob first so large images don't hit the
      // 4.5 MB serverless body limit, then send the lead with their references.
      const uploadedPhotos = await Promise.all(
        photos.map(async photo => {
          const blob = await upload(photo.name, photo, {
            access: 'private',
            handleUploadUrl: '/api/quotes/upload',
            contentType: photo.type,
          });
          return {
            url: blob.url,
            pathname: blob.pathname,
            fileName: photo.name,
            mimeType: photo.type,
            sizeBytes: photo.size,
          };
        })
      );

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, photos: uploadedPhotos }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? 'Unable to save quote request.');
      }

      const result = await response.json() as { quoteNumber?: string };
      setSavedQuoteNumber(result.quoteNumber ?? '');
      setQuoteSubmitting(false);
      return true;
    } catch (error) {
      setQuoteSubmitting(false);
      const message = error instanceof Error ? error.message : 'We could not save your quote request. Please try again or call us directly.';
      setQuoteError(message);
      return false;
    }
  }

  // ── Pricing ──

  const pricing = calcFixedWheelPricing(vehicle.wheelCount);
  const years = Array.from({ length: 27 }, (_, i) => (2026 - i).toString());

  // ── Render ──

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      {/* Sticky progress bar */}
      <div className="sticky top-16 z-40 border-b border-brand-graphite/60 bg-brand-jet/95 backdrop-blur-md">
        <div className="section-container py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-body text-caption text-brand-silver">
              Step <span className="font-semibold text-brand-white">{step}</span> of {TOTAL_STEPS}
            </p>
            <p className="font-body text-caption text-brand-smoke">{STEP_LABELS[step - 1]}</p>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-brand-graphite">
            <motion.div
              className="h-full rounded-full bg-brand-red"
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={transition}
            />
          </div>
          {/* Step dots */}
          <div className="mt-3 flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-colors duration-300',
                  i + 1 < step  ? 'border-brand-red bg-brand-red text-white'
                  : i + 1 === step ? 'border-brand-red bg-brand-red/20 text-brand-red'
                  :                  'border-brand-ash bg-transparent text-brand-silver'
                )}>
                  {i + 1 < step ? <IconCheck /> : i + 1}
                </div>
                <span className={cn(
                  'hidden font-body text-[10px] sm:block',
                  i + 1 === step ? 'text-brand-white' : 'text-brand-silver'
                )}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="section-container pt-12">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >

              {/* ── STEP 1: Photo Upload ── */}
              {step === 1 && (
                <div>
                  <StepHeading
                    step={1}
                    title="Upload Wheel Photos"
                    subtitle="Add at least 1 photo of your wheels. Include close-ups of any damage and a full-wheel shot when possible."
                  />

                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                      'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300',
                      isDragging
                        ? 'border-brand-red bg-brand-red/10 scale-[1.01]'
                        : 'border-brand-ash bg-brand-graphite hover:border-brand-red/60 hover:bg-brand-graphite-light'
                    )}
                  >
                    <div className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300',
                      isDragging ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-graphite-light text-brand-silver'
                    )}>
                      <IconUpload />
                    </div>
                    <div>
                      <p className="font-display text-body-lg text-brand-white">
                        {isDragging ? 'Drop photos here' : 'Drag & drop wheel photos'}
                      </p>
                      <p className="mt-1 font-body text-body-sm text-brand-silver">
                        or <span className="text-brand-red underline">browse files</span> · JPG, PNG, HEIC · up to 8 photos
                      </p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => e.target.files && addFiles(e.target.files)}
                    />
                  </div>

                  {photoUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 grid grid-cols-4 gap-3"
                    >
                      {photoUrls.map((url, i) => (
                        <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-brand-ash bg-brand-graphite">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Wheel photo ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            onClick={e => { e.stopPropagation(); removePhoto(i); }}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-jet/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-brand-red"
                            aria-label="Remove photo"
                          >
                            <IconX />
                          </button>
                          <div className="absolute bottom-1 left-1 rounded bg-brand-jet/70 px-1.5 py-0.5 font-body text-[10px] text-brand-smoke">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                      {photoUrls.length < 8 && (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-brand-ash text-brand-silver transition-colors hover:border-brand-red hover:text-brand-red"
                          aria-label="Add more photos"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </motion.div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-body text-body-sm text-brand-silver">
                      {photos.length === 0
                        ? 'No photos added yet'
                        : `${photos.length} photo${photos.length !== 1 ? 's' : ''} added`}
                      {photos.length >= 1 && (
                        <span className="ml-2 text-success">· Ready to continue</span>
                      )}
                    </p>
                  </div>

                  <NavButtons
                    onNext={() => go(2)}
                    nextDisabled={photos.length < 1}
                    nextLabel="Continue to Vehicle Info"
                  />
                </div>
              )}

              {/* ── STEP 2: Vehicle Info ── */}
              {step === 2 && (
                <div>
                  <StepHeading
                    step={2}
                    title="Vehicle Details"
                    subtitle="Tell us about your vehicle and wheels so we can calculate the right price."
                  />

                  <div className="flex flex-col gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField label="Year" value={vehicle.year} onChange={v => setVehicle(s => ({ ...s, year: v }))}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </SelectField>

                      <div className="relative flex flex-col gap-1.5">
                        <label className="font-body text-body-sm font-semibold text-brand-white">Make</label>
                        <input
                          type="text"
                          value={vehicle.make}
                          onChange={e => onMakeChange(e.target.value)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                          onFocus={() => vehicle.make && setShowSuggestions(suggestions.length > 0)}
                          placeholder="e.g. Porsche"
                          className="w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors duration-200"
                        />
                        <AnimatePresence>
                          {showSuggestions && (
                            <motion.ul
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-brand-ash bg-brand-graphite shadow-card"
                            >
                              {suggestions.map(s => (
                                <li key={s}>
                                  <button
                                    type="button"
                                    className="w-full px-4 py-2.5 text-left font-body text-body-sm text-brand-smoke hover:bg-brand-graphite-light hover:text-brand-white transition-colors"
                                    onMouseDown={() => {
                                      setVehicle(v => ({ ...v, make: s }));
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    {s}
                                  </button>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <TextField
                      label="Model"
                      value={vehicle.model}
                      onChange={v => setVehicle(s => ({ ...s, model: v }))}
                      placeholder="e.g. 911 Carrera"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField label="Wheel Size" value={vehicle.wheelSize} onChange={v => setVehicle(s => ({ ...s, wheelSize: v }))}>
                        {WHEEL_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                      </SelectField>

                      <SelectField label="Current Finish" value={vehicle.currentFinish} onChange={v => setVehicle(s => ({ ...s, currentFinish: v }))}>
                        {CURRENT_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                      </SelectField>
                    </div>

                    <SelectField label="Service Region" value={vehicle.region} onChange={v => setVehicle(s => ({ ...s, region: v }))}>
                      {REGIONS.map(r => (
                        <option key={r.value} value={r.value}>
                          {r.label}{r.fee > 0 ? ` (+$${r.fee})` : ' (no surcharge)'}
                        </option>
                      ))}
                    </SelectField>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-semibold text-brand-white">Number of Wheels</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setVehicle(v => ({ ...v, wheelCount: n }))}
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-xl border font-display text-display-sm transition-all duration-200',
                              vehicle.wheelCount === n
                                ? 'border-brand-red bg-brand-red text-white shadow-red-glow'
                                : 'border-brand-ash bg-brand-graphite text-brand-smoke hover:border-brand-red/60 hover:text-brand-white'
                            )}
                          >
                            {n}
                          </button>
                        ))}
                        <p className="font-body text-body-sm text-brand-silver">
                          {vehicle.wheelCount === 4 && '· 10% multi-wheel discount applied'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <NavButtons
                    onBack={() => go(1)}
                    onNext={() => go(3)}
                    nextDisabled={!vehicle.make || !vehicle.model}
                    nextLabel="Continue"
                  />
                </div>
              )}

              {/* ── STEP 3: AI Analysis ── */}
              {step === 3 && (
                <div>
                  <StepHeading
                    step={3}
                    title="How Many Wheels?"
                    subtitle="Select the number of wheels you'd like to restore. Our team will review your photos and confirm final pricing."
                  />

                  <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6">
                      <p className="mb-4 font-body text-body-sm font-semibold text-brand-white">Select Number of Wheels</p>
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(count => (
                          <button
                            key={count}
                            onClick={() => updateWheelCount(count)}
                            className={cn(
                              'rounded-xl border-2 py-4 font-display text-body-md font-bold transition-all duration-200',
                              vehicle.wheelCount === count
                                ? 'border-brand-red bg-brand-red/20 text-brand-red'
                                : 'border-brand-ash bg-transparent text-brand-silver hover:border-brand-red/50'
                            )}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="mt-0.5 text-brand-red"><IconSpark /></div>
                        <div>
                          <p className="font-display text-body-md text-brand-white">Fixed Pricing</p>
                          <p className="mt-1 font-body text-body-sm text-brand-smoke">
                            <strong className="text-brand-white">$250 per wheel</strong> · 4+ wheels get <strong className="text-success">$200 off</strong> · Plus 5% GST + 7% PST
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-brand-ash pt-4">
                        {(() => {
                          const pricing = calcFixedWheelPricing(vehicle.wheelCount);
                          return (
                            <>
                              <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                <span>{vehicle.wheelCount} wheels × $250</span>
                                <span className="text-brand-white">${(vehicle.wheelCount * 250).toFixed(2)}</span>
                              </div>
                              {vehicle.wheelCount >= 4 && (
                                <div className="flex justify-between font-body text-body-sm text-success">
                                  <span>Bulk discount (4+ wheels)</span>
                                  <span>-$200.00</span>
                                </div>
                              )}
                              <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                <span>GST (5%)</span>
                                <span className="text-brand-white">${pricing.gst.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                <span>PST (7%)</span>
                                <span className="text-brand-white">${pricing.pst.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between border-t border-brand-ash pt-2 font-display text-display-sm text-brand-red">
                                <span>Total</span>
                                <span>${pricing.total.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <NavButtons
                    onBack={() => go(2)}
                    onNext={() => go(4)}
                    nextLabel="Continue"
                  />
                </div>
              )}

              {/* ── STEP 4: Finish Selection ── */}
              {step === 4 && (
                <div>
                  <StepHeading
                    step={4}
                    title="Choose Your Finish"
                    subtitle="Select the refinishing style you want. Price adjustments are shown per wheel."
                  />

                  <div className="flex flex-col gap-3">
                    {FINISHES.map(f => (
                      <motion.button
                        key={f.value}
                        onClick={() => setFinish(s => ({ ...s, type: f.value }))}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          'flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200',
                          finish.type === f.value
                            ? 'border-brand-red bg-brand-red/10 shadow-red-glow/20'
                            : 'border-brand-ash bg-brand-graphite hover:border-brand-ash'
                        )}
                      >
                        <div className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
                          finish.type === f.value ? 'border-brand-red bg-brand-red' : 'border-brand-ash bg-transparent'
                        )}>
                          {finish.type === f.value && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div className={cn(
                          'h-10 w-10 shrink-0 rounded-xl border border-brand-ash/60',
                          f.value === 'oem'      ? 'bg-gradient-to-br from-brand-silver to-brand-ash'
                          : f.value === 'custom' ? ''
                          : f.value === 'chrome' ? 'bg-gradient-to-br from-white via-brand-silver to-brand-ash'
                          : f.value === 'caliper' ? 'bg-gradient-to-br from-brand-graphite-light to-brand-ash'
                          :                        'bg-gradient-to-r from-brand-graphite-light to-brand-silver'
                        )}
                          style={f.value === 'custom' ? { backgroundColor: finish.customColor } : {}}
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="font-display text-body-md text-brand-white">{f.label}</p>
                            <p className="font-body text-caption text-brand-silver">{f.description}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {f.premium > 0
                            ? <p className="font-display text-body-sm text-brand-red">+${f.premium}/wheel</p>
                            : <p className="font-body text-caption text-success">Included</p>}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {finish.type === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-5">
                          <p className="mb-3 font-body text-body-sm font-semibold text-brand-white">Pick Your Color</p>
                          <div className="flex items-center gap-4">
                            <input
                              type="color"
                              value={finish.customColor}
                              onChange={e => setFinish(s => ({ ...s, customColor: e.target.value }))}
                              className="h-12 w-12 cursor-pointer rounded-xl border-2 border-brand-ash bg-transparent p-0.5"
                            />
                            <div>
                              <p className="font-display text-body-sm text-brand-white">{finish.customColor.toUpperCase()}</p>
                              <p className="font-body text-caption text-brand-silver">Custom colours are exact-matched</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {['#0A0A0B','#D81E2A','#1E3A5F','#F5F5F7','#C0C0C0','#FFD700','#1C6B35','#7B2FBE'].map(c => (
                              <button
                                key={c}
                                onClick={() => setFinish(s => ({ ...s, customColor: c }))}
                                className={cn(
                                  'h-8 w-8 rounded-lg border-2 transition-all duration-150 hover:scale-110',
                                  finish.customColor === c ? 'border-brand-white scale-110' : 'border-brand-ash/60'
                                )}
                                style={{ backgroundColor: c }}
                                aria-label={`Select color ${c}`}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <NavButtons
                    onBack={() => go(3)}
                    onNext={() => go(5)}
                    nextLabel="Continue"
                  />
                </div>
              )}

              {/* ── STEP 5: Contact Info (NEW) ── */}
              {step === 5 && (
                <div>
                  <StepHeading
                    step={5}
                    title="Almost there!"
                    subtitle="Add your contact details so our team can review the estimate and follow up."
                  />

                  <div className="flex flex-col gap-5">
                    {/* Name */}
                    <TextField
                      label="Full Name"
                      value={contact.fullName}
                      onChange={v => setContact(c => ({ ...c, fullName: v }))}
                      placeholder="Jane Smith"
                      icon={<IconUser />}
                      error={contactErrors.fullName}
                    />

                    {/* Email */}
                    <TextField
                      label="Email Address"
                      value={contact.email}
                      onChange={v => setContact(c => ({ ...c, email: v }))}
                      placeholder="jane@example.com"
                      type="email"
                      icon={<IconMail />}
                      error={contactErrors.email}
                    />

                    {/* Phone */}
                    <TextField
                      label="Phone Number"
                      value={contact.phone}
                      onChange={v => setContact(c => ({ ...c, phone: formatPhone(v) }))}
                      placeholder="604.555.1234"
                      type="tel"
                      icon={<IconPhone />}
                      error={contactErrors.phone}
                    />

                    {/* Location */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-semibold text-brand-white">
                        <span className="flex items-center gap-2">
                          <IconMapPin />
                          City / Location
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={contact.location}
                          onChange={e => setContact(c => ({ ...c, location: e.target.value, otherCity: '' }))}
                          className={cn(
                            'w-full appearance-none rounded-xl border bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white focus:outline-none focus:ring-1 transition-colors duration-200 pr-10',
                            contactErrors.location
                              ? 'border-brand-red focus:border-brand-red focus:ring-brand-red'
                              : 'border-brand-ash focus:border-brand-red focus:ring-brand-red'
                          )}
                        >
                          <option value="" disabled>Select your city…</option>
                          {LOCATION_GROUPS.map(group => (
                            <optgroup key={group.group} label={`── ${group.group} ──`}>
                              {group.cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </optgroup>
                          ))}
                          <option value="other">Other…</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver">
                          <IconChevronDown />
                        </span>
                      </div>
                      {contactErrors.location && (
                        <p className="font-body text-caption text-brand-red">{contactErrors.location}</p>
                      )}
                    </div>

                    {/* Other city text input */}
                    <AnimatePresence>
                      {contact.location === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <TextField
                            label="Your City"
                            value={contact.otherCity}
                            onChange={v => setContact(c => ({ ...c, otherCity: v }))}
                            placeholder="e.g. Prince George"
                            error={contactErrors.otherCity}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Consent checkboxes */}
                    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-brand-ash bg-brand-graphite p-5">
                      {/* Marketing consent — optional */}
                      <label className="flex cursor-pointer items-start gap-3">
                        <div
                          onClick={() => setContact(c => ({ ...c, marketingConsent: !c.marketingConsent }))}
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150',
                            contact.marketingConsent
                              ? 'border-brand-red bg-brand-red'
                              : 'border-brand-ash bg-transparent hover:border-brand-silver'
                          )}
                        >
                          {contact.marketingConsent && <IconCheck />}
                        </div>
                        <span className="font-body text-body-sm text-brand-smoke">
                          Yes, I&rsquo;d like tips, seasonal offers, and wheel care advice via email{' '}
                          <span className="text-brand-silver">(optional)</span>
                        </span>
                      </label>

                      {/* Contact consent — required */}
                      <label className="flex cursor-pointer items-start gap-3">
                        <div
                          onClick={() => {
                            setContact(c => ({ ...c, contactConsent: !c.contactConsent }));
                            if (!contact.contactConsent) {
                              setContactErrors(e => ({ ...e, contactConsent: undefined }));
                            }
                          }}
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150',
                            contact.contactConsent
                              ? 'border-brand-red bg-brand-red'
                              : contactErrors.contactConsent
                                ? 'border-brand-red bg-transparent'
                                : 'border-brand-ash bg-transparent hover:border-brand-silver'
                          )}
                        >
                          {contact.contactConsent && <IconCheck />}
                        </div>
                        <div>
                          <span className="font-body text-body-sm text-brand-smoke">
                            I agree to be contacted about my quote{' '}
                            <span className="text-brand-red">*</span>
                          </span>
                          {contactErrors.contactConsent && (
                            <p className="mt-0.5 font-body text-caption text-brand-red">{contactErrors.contactConsent}</p>
                          )}
                        </div>
                      </label>
                    </div>

                    <p className="font-body text-caption text-brand-silver">
                      We respect your privacy. Your details are used only to prepare your quote and follow up. We never sell your data.
                    </p>
                    {quoteError && (
                      <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 font-body text-body-sm text-brand-red">
                        {quoteError}
                      </p>
                    )}
                  </div>

                  <NavButtons
                    onBack={() => go(4)}
                    onNext={async () => {
                      if (!validateContact()) return;
                      const saved = await saveEstimatorLead();
                      if (saved) go(6);
                    }}
                    nextLabel={quoteSubmitting ? 'Saving…' : 'Get My Quote →'}
                    nextDisabled={quoteSubmitting}
                  />
                </div>
              )}

              {/* ── STEP 6: Instant Quote ── */}
              {step === 6 && (
                <div>
                  <StepHeading
                    step={6}
                    title="Your Instant Quote"
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transition}
                  >
                    {/* Personalised greeting */}
                    <div className="mb-5 rounded-2xl border border-brand-ash bg-brand-graphite px-5 py-4">
                      <p className="font-body text-body-sm text-brand-smoke">
                        Hi <strong className="text-brand-white">{contact.fullName.split(' ')[0]}</strong> — here&rsquo;s your estimated price.
                        Your request has been saved for team review{savedQuoteNumber ? ` as ${savedQuoteNumber}` : ''}.
                      </p>
                    </div>

                    {/* Vehicle summary pills */}
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                      {[
                        `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                        `${vehicle.wheelCount} wheels`,
                        FINISHES.find(f => f.value === finish.type)?.label ?? '',
                      ].filter(Boolean).map((tag, i) => (
                        <span key={i} className="rounded-full border border-brand-ash bg-brand-graphite px-3 py-1 font-body text-caption text-brand-smoke">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="mb-6 overflow-hidden rounded-3xl border border-brand-ash bg-brand-graphite shadow-card">
                      <div className="border-b border-brand-graphite-light px-6 py-4">
                        <p className="font-display text-body-md text-brand-white">Estimated Price</p>
                      </div>

                      <div className="px-6 py-5">
                        {(() => {
                          const pricing = calcFixedWheelPricing(vehicle.wheelCount);
                          return (
                            <>
                              <div className="mb-4 flex flex-col gap-2">
                                <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                  <span>{vehicle.wheelCount} wheels × $250</span>
                                  <span className="text-brand-white">${(vehicle.wheelCount * 250).toFixed(2)}</span>
                                </div>
                                {vehicle.wheelCount >= 4 && (
                                  <div className="flex justify-between font-body text-body-sm text-success">
                                    <span>Bulk discount (4+ wheels)</span>
                                    <span>-$200.00</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 border-t border-brand-graphite-light pt-4">
                                <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                  <span>Subtotal</span>
                                  <span className="text-brand-white">${pricing.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                  <span>GST (5%)</span>
                                  <span className="text-brand-white">${pricing.gst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-body text-body-sm text-brand-smoke">
                                  <span>PST (7%)</span>
                                  <span className="text-brand-white">${pricing.pst.toFixed(2)}</span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-brand-graphite-light px-5 py-4">
                                <p className="font-display text-display-sm text-brand-white">Estimated Total</p>
                                <p className="font-display text-display-md text-brand-white">
                                  ${pricing.total.toFixed(2)}
                                  <span className="ml-1 font-body text-body-sm text-brand-silver">CAD</span>
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="border-t border-brand-graphite-light px-6 py-4">
                        <p className="font-body text-caption text-brand-silver">
                          This is an estimate based on wheel count. Final price confirmed by our team before work begins.
                        </p>
                      </div>
                    </div>

                      {/* CTAs */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          variant="primary"
                          size="lg"
                          rightIcon={<IconArrowRight />}
                          className="flex-1 justify-center"
                          onClick={() => {
                            const target = savedQuoteNumber
                              ? `/quote/success?quote=${encodeURIComponent(savedQuoteNumber)}`
                              : '/quote/success';
                            router.push(target);
                          }}
                        >
                          Book This Service
                        </Button>
                        <Button href="tel:+16047106174" variant="secondary" size="lg" leftIcon={<IconPhone />} className="flex-1 justify-center">
                          604.710.6174
                        </Button>
                      </div>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => go(5)}
                          className="font-body text-body-sm text-brand-silver underline hover:text-brand-white transition-colors"
                        >
                          ← Edit contact details
                        </button>
                      </div>
                    </motion.div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
