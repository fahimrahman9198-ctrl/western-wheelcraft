import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Book Now',
  description:
    'Book your wheel refinishing with Western Wheelcraft. Visit our Burnaby shop or request mobile fleet service for Vancouver Island and Interior BC.',
};

function IconBuilding() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4h6v4M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 3h15v13H1V3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

const trustBadges = [
  { icon: <IconAward />, label: 'Red Seal Certified', sub: 'Interprovincial trade certification' },
  { icon: <IconShield />, label: '12-Month Warranty', sub: 'All refinishing work covered' },
  { icon: <IconStar />, label: 'ICBC Accredited', sub: 'Approved repair facility' },
];

export default function BookingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-10 h-[500px] w-[500px] rounded-full bg-brand-red/5 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/4 blur-3xl" />
        </div>
        <div className="section-container relative text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              Book Online
            </span>
          </div>
          <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-brand-white">
            Book Your Wheel Refinishing
          </h1>
          <p className="mx-auto font-body text-body-lg text-brand-smoke">
            Whether you visit our shop or our fleet visits you — choose your path below.
          </p>
        </div>
      </section>

      {/* Two paths */}
      <section className="bg-brand-jet-light py-20">
        <div className="section-container">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Shop Drop-Off */}
            <FadeIn delay={0}>
              <div className="flex h-full flex-col rounded-3xl border border-brand-red/30 bg-brand-graphite p-8 md:p-10 shadow-card">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                  <IconBuilding />
                </div>
                <div className="mb-2 inline-flex w-fit items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Lower Mainland
                </div>
                <h2 className="mb-3 font-display text-display-sm md:text-display-md text-brand-white">
                  Shop Drop-Off
                </h2>
                <p className="mb-6 font-body text-body-md text-brand-smoke leading-relaxed flex-1">
                  Visit our Burnaby HQ at 3756 Napier St. Drop off your wheels or leave
                  the whole vehicle — we handle alignment, balancing, and TPMS too.
                  Most jobs ready same day or next morning.
                </p>
                <ul className="mb-8 flex flex-col gap-2.5">
                  {[
                    'Same-day turnaround on most repairs',
                    'Full wheel balancing & TPMS service',
                    'Mon–Fri 8am–5pm · Sat 9am–2pm',
                    '3756 Napier St, Burnaby BC',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 font-body text-body-sm text-brand-silver">
                      <span className="shrink-0 text-success"><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button href="/booking/wizard" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
                  Book Drop-Off Time
                </Button>
              </div>
            </FadeIn>

            {/* Mobile Fleet */}
            <FadeIn delay={120}>
              <div className="flex h-full flex-col rounded-3xl border border-brand-ash/50 bg-brand-graphite p-8 md:p-10 shadow-card">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                  <IconTruck />
                </div>
                <div className="mb-2 inline-flex w-fit items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Island & Interior BC
                </div>
                <h2 className="mb-3 font-display text-display-sm md:text-display-md text-brand-white">
                  Mobile Fleet Service
                </h2>
                <p className="mb-6 font-body text-body-md text-brand-smoke leading-relaxed flex-1">
                  Our fully equipped truck comes to your home, dealership, or commercial
                  yard. Available across Vancouver Island, Okanagan, Kelowna, and Kamloops
                  on scheduled service routes.
                </p>
                <ul className="mb-8 flex flex-col gap-2.5">
                  {[
                    'Vancouver Island: Victoria, Nanaimo, Duncan',
                    'Okanagan: Kelowna, Penticton, Vernon',
                    'Kamloops & Thompson-Nicola region',
                    'Dealership & fleet accounts welcome',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 font-body text-body-sm text-brand-silver">
                      <span className="shrink-0 text-success"><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button href="/booking/wizard" variant="secondary" size="lg" rightIcon={<IconArrowRight />}>
                  Book Mobile Service
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-brand-graphite/60 bg-brand-jet py-12">
        <div className="section-container">
          <div className="grid gap-6 sm:grid-cols-3">
            {trustBadges.map((badge, i) => (
              <FadeIn key={badge.label} delay={i * 80}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="font-display text-body-md text-brand-white">{badge.label}</p>
                    <p className="font-body text-body-sm text-brand-silver">{badge.sub}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-jet py-20">
        <div className="section-container text-center">
          <FadeIn>
            <h2 className="mb-4 font-display text-display-sm md:text-display-md text-brand-white">
              Not sure which option is right for you?
            </h2>
            <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
              Tell us your location and we&rsquo;ll recommend the best service option for you.
            </p>
            <Button href="/contact" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
              Talk to Us First
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
