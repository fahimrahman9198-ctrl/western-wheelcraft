declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// No-ops when GA hasn't loaded (e.g. NEXT_PUBLIC_GA_ID unset) so callers never
// need to guard this themselves.
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}
