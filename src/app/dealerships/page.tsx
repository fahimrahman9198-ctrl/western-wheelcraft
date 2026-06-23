import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Dealerships — Trade Partner Program',
  description:
    'Western Wheelcraft trade accounts for BC dealerships. Priority service, volume pricing, dedicated account management, and fleet tracking.',
};

function IconZap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function IconQuote() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

const benefits = [
  {
    icon: <IconZap />,
    title: 'Priority Service',
    description:
      '24–48 hour turnaround guaranteed for trade accounts. We schedule your fleet jobs around your operations — not the other way around.',
  },
  {
    icon: <IconBarChart />,
    title: 'Volume Pricing',
    description:
      'Competitive per-wheel rates for ongoing refinishing contracts. The more you send, the better your rate. Invoiced monthly.',
  },
  {
    icon: <IconUser />,
    title: 'Dedicated Account Manager',
    description:
      'One point of contact for all your refinishing needs. Direct line, fast quotes, and proactive communication on every job.',
  },
  {
    icon: <IconLayout />,
    title: 'Fleet Dashboard',
    description:
      'Track your active jobs, invoices, and refinishing history in a dedicated portal. Know the status of every wheel, always.',
  },
];

const logos = [
  'Ferrari Maserati Vancouver',
  'BMW Store',
  'Mercedes-Benz Vancouver',
  'Audi Downtown',
  'SR Auto Group',
  'Weissach Performance',
];

const testimonials = [
  {
    quote:
      "We've partnered with Western Wheelcraft for over eight years. Their turnaround time and finish quality keep our customer cars looking showroom-perfect — every time.",
    name: 'Service Manager',
    dealership: 'Ferrari Maserati Vancouver',
  },
  {
    quote:
      "Our go-to refinishing partner. They understand the quality standard our customers expect, and they consistently deliver. The account manager is responsive and proactive.",
    name: 'Parts & Service Director',
    dealership: 'BMW Store Vancouver',
  },
  {
    quote:
      "Volume pricing and reliable service have made Western Wheelcraft an essential part of our operations. The fleet dashboard alone has saved us hours every month.",
    name: 'Fleet Manager',
    dealership: 'SR Auto Group',
  },
];

export default function DealershipsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-28">
        <Image
          src="/images/ferrari-vans.jpg"
          alt="Western Wheelcraft mobile fleet vans servicing dealership vehicles"
          fill
          className="object-cover object-center"
          preload
        />
        <div className="absolute inset-0 bg-brand-jet/80" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/4 blur-3xl" />
        </div>
        <div className="section-container relative">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
              <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
                Trade Partner Program
              </span>
            </div>
            <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-brand-white">
              BC&rsquo;s Preferred Refinishing Partner for Dealerships
            </h1>
            <p className="mb-8 max-w-lg font-body text-body-lg text-brand-smoke">
              Priority service, volume pricing, and dedicated account management — built
              for BC&rsquo;s leading dealerships and fleet operators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
                Apply for Trade Account
              </Button>
              <Button href="tel:+16047106174" variant="secondary" size="lg">
                Talk to Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Trade Account Benefits</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                Everything you need to run a tight refinishing operation — without the overhead.
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 70}>
                <Card variant="elevated" padding="lg" className="h-full">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-body-lg">{benefit.title}</CardTitle>
                    <CardDescription className="text-body-sm leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="bg-brand-jet py-20">
        <div className="section-container">
          <FadeIn>
            <div className="mb-10 text-center">
              <p className="font-body text-body-sm font-semibold uppercase tracking-widest text-brand-silver">
                Trusted by BC&rsquo;s Leading Dealerships
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={60}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {logos.map((logo) => (
                <div
                  key={logo}
                  className="flex items-center justify-center rounded-xl border border-brand-graphite bg-brand-graphite px-4 py-5 text-center"
                >
                  <span className="font-display text-caption leading-tight text-brand-silver">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-brand-jet-light py-16">
        <div className="section-container">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-brand-red/20 bg-brand-graphite px-8 py-14 text-center shadow-card md:py-16">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-56 w-[400px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-3xl" />
              </div>
              <div className="relative">
                <div className="accent-line mx-auto mb-5" aria-hidden="true" />
                <h2 className="mb-3 font-display text-display-md text-brand-white">
                  Ready to become a Trade Partner?
                </h2>
                <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
                  Apply for a trade account and get onboarded in under 48 hours. No minimums to get started.
                </p>
                <Button href="/contact" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
                  Apply for Trade Account
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">What Our Partners Say</h2>
            </div>
          </FadeIn>
          <FadeIn delay={60}>
            <div className="relative mb-10 overflow-hidden rounded-3xl aspect-[21/9] shadow-card group">
              <Image
                src="/images/ferrari-shop.jpg"
                alt="Ferrari at Western Wheelcraft's Burnaby shop"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-jet/40 via-transparent to-transparent" aria-hidden="true" />
            </div>
          </FadeIn>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.dealership} delay={i * 80}>
                <div className="flex flex-col rounded-2xl border border-brand-graphite bg-brand-graphite p-7 shadow-card h-full">
                  <div className="mb-4 text-brand-red">
                    <IconQuote />
                  </div>
                  <p className="mb-6 flex-1 font-body text-body-md italic text-brand-smoke leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-brand-graphite-light pt-4">
                    <p className="font-display text-body-sm text-brand-white">{t.name}</p>
                    <p className="font-body text-caption text-brand-red">{t.dealership}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
