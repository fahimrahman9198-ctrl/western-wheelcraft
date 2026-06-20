// Pricing constants — single source of truth for quote & checkout

export const BASE_PRICE: Record<'light' | 'medium', number> = {
  light: 300,
  medium: 400,
};

export const SIZE_PREMIUM: Record<string, number> = {
  '16"': 0, '17"': 0, '18"': 25, '19"': 25,
  '20"': 50, '21"': 50, '22"+': 75,
};

export const FINISH_PREMIUM: Record<string, number> = {
  oem: 50, custom: 0, chrome: 100, powder: 0, 'two-tone': 75,
};

export const REGION_FEE: Record<string, number> = {
  'lm-shop': 0, 'lm-express': 25, 'lm-mobile': 40, vi: 60, interior: 80,
};

export const FINISH_LABELS: Record<string, string> = {
  oem: 'OEM Color Match', custom: 'Custom Color', chrome: 'Chrome',
  powder: 'Powder Coat', 'two-tone': 'Two-Tone',
};

export const REGION_LABELS: Record<string, string> = {
  'lm-shop':    'Lower Mainland — Shop Drop-Off',
  'lm-express': 'Lower Mainland — Express Mobile',
  'lm-mobile':  'Lower Mainland — Mobile Service',
  vi:           'Vancouver Island',
  interior:     'Okanagan & Interior BC',
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type DamageLevel = 'light' | 'medium' | 'heavy' | 'standard';

export interface WheelDamage {
  level: DamageLevel;
  pct: number;
}

export interface QuoteData {
  vehicle: {
    year: string;
    make: string;
    model: string;
    wheelSize: string;
    currentFinish: string;
    region: string;
    wheelCount: number;
  };
  damage: WheelDamage[];
  finish: { type: string; customColor: string };
  pricing: PricingBreakdown;
}

export interface BookingData {
  serviceType: 'shop' | 'mobile';
  date: string;
  time: string;
  vehicle: string;
  region: string;
  notes: string;
  estimatedTotal: number;
}

export interface ConfirmationRecord {
  confirmationNumber: string;
  type: 'quote' | 'booking' | 'invoice';
  paidAmount: number;
  paymentType: 'full' | 'deposit';
  customerName: string;
  customerEmail: string;
  createdAt: string;
  quoteData?: QuoteData;
  bookingData?: BookingData;
}

export interface PricingBreakdown {
  wheels: { label: string; base: number; level: DamageLevel }[];
  sizePremium: number;
  finishPremium: number;
  regionFee: number;
  wheelTotal: number;
  discountPct: number;
  discountAmount: number;
  afterDiscount: number;
  subtotal: number;
  gst: number;
  total: number;
  hasHeavy: boolean;
  billableCount: number;
  wheelCount?: number;
}

// ── Calculations ──────────────────────────────────────────────────────────────

export function calcPricing(
  damage: WheelDamage[],
  wheelSize: string,
  finishType: string,
  region: string,
  wheelCount: number
): PricingBreakdown {
  const billable = damage.filter(d => d.level !== 'heavy');
  const hasHeavy = damage.some(d => d.level === 'heavy');
  const sp = SIZE_PREMIUM[wheelSize] ?? 0;
  const fp = FINISH_PREMIUM[finishType] ?? 0;
  const rf = REGION_FEE[region] ?? 0;

  const wheels = billable.map((d) => ({
    label: `Wheel ${damage.indexOf(d) + 1} — ${d.level === 'light' ? 'Light' : 'Medium'} damage`,
    base: BASE_PRICE[d.level as 'light' | 'medium'],
    level: d.level,
  }));

  const wheelTotal = billable.reduce((s, d) => s + BASE_PRICE[d.level as 'light' | 'medium'] + sp + fp, 0);
  const discountPct = wheelCount === 4 && billable.length === 4 ? 0.1 : 0;
  const discountAmount = wheelTotal * discountPct;
  const afterDiscount = wheelTotal - discountAmount;
  const subtotal = afterDiscount + rf;
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return {
    wheels, sizePremium: sp * billable.length,
    finishPremium: fp * billable.length,
    regionFee: rf, wheelTotal, discountPct, discountAmount,
    afterDiscount, subtotal, gst, total, hasHeavy, billableCount: billable.length,
    wheelCount,
  };
}

export function calcFixedWheelPricing(wheelCount: number): PricingBreakdown {
  const basePerWheel = 250;
  let subtotal = wheelCount * basePerWheel;
  const bulkDiscount = wheelCount >= 4 ? 100 : 0;
  subtotal -= bulkDiscount;

  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return {
    wheels: Array.from({ length: wheelCount }, (_, i) => ({
      label: `Wheel ${i + 1}`,
      base: basePerWheel,
      level: 'standard' as const,
    })),
    sizePremium: 0,
    finishPremium: 0,
    regionFee: 0,
    wheelTotal: wheelCount * basePerWheel,
    discountPct: wheelCount >= 4 ? (bulkDiscount / (wheelCount * basePerWheel)) : 0,
    discountAmount: bulkDiscount,
    afterDiscount: subtotal,
    subtotal,
    gst,
    total,
    hasHeavy: false,
    billableCount: wheelCount,
    wheelCount,
  };
}

// ── Confirmation generation ───────────────────────────────────────────────────

export function generateConfirmationNumber(prefix: 'WWQ' | 'WWB' | 'WWI' = 'WWQ'): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const KEYS = {
  quote:        'ww_quote',
  booking:      'ww_booking',
  confirmation: 'ww_confirmation',
};

export function saveQuote(data: QuoteData) {
  if (typeof window !== 'undefined') localStorage.setItem(KEYS.quote, JSON.stringify(data));
}

export function loadQuote(): QuoteData | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEYS.quote) ?? 'null'); } catch { return null; }
}

export function saveBooking(data: BookingData) {
  if (typeof window !== 'undefined') localStorage.setItem(KEYS.booking, JSON.stringify(data));
}

export function loadBooking(): BookingData | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEYS.booking) ?? 'null'); } catch { return null; }
}

export function saveConfirmation(data: ConfirmationRecord) {
  if (typeof window !== 'undefined') localStorage.setItem(KEYS.confirmation, JSON.stringify(data));
}

export function loadConfirmation(): ConfirmationRecord | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEYS.confirmation) ?? 'null'); } catch { return null; }
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtCAD(n: number): string {
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}
