import type { Metadata } from 'next';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { ServiceSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Premium wheel refinishing services: OEM color matching, curb rash repair, diamond cut refinishing, custom finishes, caliper painting, and more.',
};

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M2 9h20M12 3L8 9l4 12 4-12-4-6z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4h6v4M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

const services = [
  {
    icon: <IconSparkle />,
    title: 'OEM Color Matching',
    description:
      'Spectrophotometer-matched paint that replicates your factory finish exactly. Indistinguishable from original — guaranteed.',
  },
  {
    icon: <IconWrench />,
    title: 'Curb Rash & Gouge Repair',
    description:
      'TIG welding, precision filling, and sanding eliminate damage down to bare metal. Structural integrity verified on every repair.',
  },
  {
    icon: <IconDiamond />,
    title: 'Diamond Cut Refinishing',
    description:
      'CNC lathe-turned polished face finish. Available for OEM diamond-cut wheels — restored to factory specification.',
  },
  {
    icon: <IconPalette />,
    title: 'Custom Finishes',
    description:
      'Matte, satin, gloss, brushed, two-tone, or full custom colour. We match your vision — or help you create one.',
  },
  {
    icon: <IconShield />,
    title: 'Caliper Painting',
    description:
      'High-temp caliper coatings in any colour to match or contrast your wheels. Heat-resistant, durable, and finished to a clean factory standard.',
  },
  {
    icon: <IconStar />,
    title: 'Lifetime Workmanship Warranty',
    description:
      'Every refinish we perform is covered by our lifetime workmanship guarantee. If our finish fails — we fix it, no questions asked.',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ServiceSchema) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-24">
        <video
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
         
          aria-hidden="true"
        >
          <source src="/videos/services-hero-mobile.mp4" data-src-desktop="/videos/services-hero.mp4" type="video/mp4" />
        </video>
        <button
          type="button"
          className="video-play-btn absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 focus:opacity-100"
          aria-label="Play video"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-red shadow-lg">
            <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/45" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-red/5 blur-3xl" />
        </div>
        <div className="section-container relative text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              Full-Service Wheel Refinishing
            </span>
          </div>
          <h1 className="mb-5 font-display text-display-lg md:text-display-xl text-white">
            Premium Wheel Refinishing Services
          </h1>
          <p className="mx-auto mb-8 max-w-xl font-body text-body-lg text-white/85">
            Professional refinishing for every make, model, and finish type — backed by our
            lifetime workmanship warranty and decades of hands-on expertise.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href="/quote/estimate" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
              Get a Free Quote
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Talk to a Technician
            </Button>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <div className="mb-14 text-center">
            <div className="accent-line mx-auto mb-5" aria-hidden="true" />
            <h2 className="font-display text-display-md text-brand-white">What We Do</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 60}>
                <Card variant="default" padding="lg" className="h-full">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                      {service.icon}
                    </div>
                    <CardTitle className="text-display-sm">{service.title}</CardTitle>
                    <CardDescription className="flex-1 text-body-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                    <Link
                      href="/contact"
                      className="mt-2 inline-flex items-center gap-1.5 font-body text-body-sm font-semibold text-brand-red hover:gap-2.5 transition-all duration-200"
                    >
                      Learn more <IconArrowRight />
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* OEM Work Showcase */}
      <section className="bg-brand-jet py-16">
        <div className="section-container">
          <FadeIn>
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl aspect-[4/3] shadow-card group">
                <Image
                  src="/images/before-after-porsche.jpg"
                  alt="OEM colour-matched wheel refinishing on a Porsche"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <div className="accent-line mb-5" aria-hidden="true" />
                <h2 className="mb-4 font-display text-display-sm md:text-display-md text-brand-white">
                  OEM Results, Every Time
                </h2>
                <p className="mb-4 font-body text-body-md text-brand-smoke leading-relaxed">
                  Spectrophotometer-matched paint, factory-accurate processes, and meticulous
                  prep work means your wheels are indistinguishable from the original — or better.
                </p>
                <p className="mb-6 font-body text-body-md text-brand-smoke leading-relaxed">
                  Whether it&rsquo;s a Porsche, a daily driver, or a dealership fleet — the
                  standard never changes.
                </p>
                <Button href="/quote/estimate" variant="primary" size="md" rightIcon={<IconArrowRight />}>
                  Get a Free Quote
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Two ways to get serviced */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-14 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Two Ways to Get Serviced</h2>
              <p className="mx-auto mt-4 max-w-xl font-body text-body-lg text-brand-smoke">
                We serve the Lower Mainland from our Burnaby shop, and reach Vancouver Island
                and Interior BC with our mobile fleet.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeIn delay={80}>
              <div className="flex flex-col rounded-3xl border border-brand-ash bg-brand-graphite p-8 shadow-card h-full">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/15 text-brand-red">
                  <IconBuilding />
                </div>
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Lower Mainland
                </span>
                <h3 className="mb-3 font-display text-display-sm text-brand-white">Shop Drop-Off Service</h3>
                <p className="mb-5 font-body text-body-md text-brand-smoke leading-relaxed flex-1">
                  Bring your wheels to our professional facility at 3756 Napier St, Burnaby.
                  Same-day and next-day turnaround available. Full workshop with alignment
                  check, balancing, and TPMS service.
                </p>
                <ul className="mb-6 flex flex-col gap-2">
                  {['Vancouver, Burnaby, Surrey, Richmond', 'Coquitlam, Langley, North Vancouver', 'Delta, New Westminster & surrounding'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-body-sm text-brand-silver">
                      <span className="h-1 w-1 rounded-full bg-brand-red" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button href="/booking" variant="primary" size="md" rightIcon={<IconArrowRight />}>
                  Book Shop Drop-Off
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={160}>
              <div className="flex flex-col rounded-3xl border border-brand-ash/50 bg-brand-graphite p-8 shadow-card h-full">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/15 text-brand-red">
                  <IconTruck />
                </div>
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Vancouver Island & Interior BC
                </span>
                <h3 className="mb-3 font-display text-display-sm text-brand-white">Mobile Fleet Service</h3>
                <p className="mb-5 font-body text-body-md text-brand-smoke leading-relaxed flex-1">
                  Our fully equipped service truck comes to your dealership, fleet yard,
                  or driveway. No need to remove wheels or tow a vehicle — we bring the
                  shop to you.
                </p>
                <ul className="mb-6 flex flex-col gap-2">
                  {['Vancouver Island: Victoria, Nanaimo, Duncan', 'Okanagan: Kelowna, Penticton, Vernon', 'Kamloops & surrounding Interior'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-body-sm text-brand-silver">
                      <span className="h-1 w-1 rounded-full bg-brand-red" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button href="/booking" variant="secondary" size="md" rightIcon={<IconArrowRight />}>
                  Book Mobile Service
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-jet-light py-16">
        <div className="section-container text-center">
          <FadeIn>
            <h2 className="mb-4 font-display text-display-sm md:text-display-md text-brand-white">
              Not sure which service you need?
            </h2>
            <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
              Send us a photo of your wheels and we&rsquo;ll recommend the right service and provide a free estimate.
            </p>
            <Button href="/quote/estimate" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
              Get Free Estimate
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
