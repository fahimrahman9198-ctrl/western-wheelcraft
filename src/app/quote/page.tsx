import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Get an instant wheel refinishing quote from Western Wheelcraft. Upload photos, select your service, and receive an estimate within hours.',
};

function IconCamera() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

const steps = [
  {
    number: '01',
    icon: <IconCamera />,
    title: 'Upload Photos',
    description:
      'Take clear photos of your wheels — close-ups of damage and overall shots. The more detail, the more accurate our estimate.',
  },
  {
    number: '02',
    icon: <IconClipboard />,
    title: 'Select Service',
    description:
      'Tell us your region, wheel type, and what finish you want. We&rsquo;ll ask a few quick questions to narrow down the right service.',
  },
  {
    number: '03',
    icon: <IconCheckCircle />,
    title: 'Get Your Quote',
    description:
      'We&rsquo;ll review your photos and send a detailed quote within a few hours. No obligation — just an honest price.',
  },
];

const trustItems = [
  { icon: <IconUsers />, text: 'Used by 500+ customers monthly' },
  { icon: <IconShield />, text: 'No-obligation estimate' },
  { icon: <IconStar />, text: 'Lifetime workmanship warranty' },
];

export default function QuotePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-red/6 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-red/30 to-transparent" />
        </div>
        <div className="section-container relative text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              Free · No Obligation · Fast
            </span>
          </div>
          <h1 className="mb-5 font-display text-display-lg md:text-display-xl text-brand-white">
            Get an Instant Quote<br className="hidden sm:block" /> in 60 Seconds
          </h1>
          <p className="mx-auto mb-10 max-w-xl font-body text-body-lg text-brand-smoke">
            Send us photos of your wheels and we&rsquo;ll have an accurate, no-obligation
            estimate back to you within a few hours.
          </p>
          <Button href="/contact" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
            Start Free Estimate
          </Button>
          <p className="mt-4 font-body text-caption text-brand-silver">
            Photos help us assess damage. Final price confirmed by technician.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-y border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
            {trustItems.map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 font-body text-body-sm text-brand-smoke">
                <span className="text-brand-red">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-step process */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-14 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">How It Works</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                Three simple steps from photo to quote — most estimates are back within 2 hours.
              </p>
            </div>
          </FadeIn>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector lines */}
            <div aria-hidden="true" className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-red/20 to-transparent md:block" />

            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 100}>
                <div className="relative flex flex-col items-center rounded-3xl border border-brand-ash bg-brand-graphite p-8 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 right-5 font-display text-display-lg text-brand-smoke select-none">
                    {step.number}
                  </div>
                  <h3 className="mb-3 font-display text-display-sm text-brand-white">{step.title}</h3>
                  <p className="font-body text-body-sm text-brand-smoke leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ-style notes */}
      <section className="bg-brand-jet-light py-16">
        <div className="section-container">
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              <div className="mb-8 text-center">
                <h2 className="font-display text-display-sm text-brand-white">Good to Know</h2>
              </div>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { q: 'How accurate is the estimate?', a: 'Photo-based quotes are typically within 10–15% of the final price. A technician confirms the final cost before work begins.' },
                { q: 'Do I have to remove my wheels?', a: 'For shop service, yes. For mobile fleet regions, our technicians can work on-vehicle at your location.' },
                { q: 'How long does refinishing take?', a: 'Most curb rash repairs: same day. Full refinishes: 1–2 business days. Diamond cut: 2–3 days.' },
                { q: 'What if I need multiple wheels?', a: 'Volume pricing applies for 3+ wheels. Let us know in your quote request and we\'ll include a bundle price.' },
              ].map((item, i) => (
                <FadeIn key={item.q} delay={i * 60}>
                  <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-5">
                    <h3 className="mb-2 font-display text-body-md text-brand-white">{item.q}</h3>
                    <p className="font-body text-body-sm text-brand-silver leading-relaxed">{item.a}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-jet py-20">
        <div className="section-container text-center">
          <FadeIn>
            <h2 className="mb-4 font-display text-display-sm md:text-display-md text-brand-white">
              Ready for your estimate?
            </h2>
            <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
              No commitment. Just an honest price from BC&rsquo;s most trusted wheel refinishers.
            </p>
            <Button href="/contact" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
              Start Free Estimate
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
