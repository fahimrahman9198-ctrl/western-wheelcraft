import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 3h15v13H1V3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3L1 7v14l8-4 6 4 8-4V3l-8 4-6-4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 3v14M15 7v14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const trustBadges = [
  { value: "5M+", label: "Wheels Refinished", sublabel: "And counting" },
  { value: "3", label: "Regions Served", sublabel: "Across BC" },
  { value: "100%", label: "Satisfaction Guarantee", sublabel: "Or we re-do it" },
];

const whyUsCards = [
  {
    icon: <IconSparkle />,
    title: "OEM Color Matching",
    description:
      "Factory-accurate finishes using spectrophotometer-matched paint. Your wheels leave looking exactly as they left the factory floor — or better.",
  },
  {
    icon: <IconWrench />,
    title: "Curb Rash & Gouge Repair",
    description:
      "Precision welding, filling, and resurfacing eliminates scrapes down to bare metal. Structural integrity checked on every repair.",
  },
  {
    icon: <IconTruck />,
    title: "Mobile Fleet Service",
    description:
      "Our fleet truck comes to your dealership, yard, or driveway across Vancouver Island and Interior BC. Shop service in the Lower Mainland.",
  },
  {
    icon: <IconPalette />,
    title: "Custom Finishes",
    description:
      "Matte, gloss, satin, two-tone, or full custom colour. Express your build without compromising quality.",
  },
  {
    icon: <IconShield />,
    title: "Lifetime Workmanship Warranty",
    description:
      "Every refinish is backed by our craftsmanship guarantee. If it peels, chips, or fades from our work — we fix it, no questions asked.",
  },
  {
    icon: <IconStar />,
    title: "Certified Technicians",
    description:
      "Red Seal certified and ICBC accredited. Decades of combined experience across passenger, performance, and commercial wheels.",
  },
];

const regions = [
  {
    name: "Lower Mainland",
    tag: "Shop Drop-Off",
    tagNote: "Visit Our Burnaby Shop",
    cities: ["Burnaby", "Vancouver", "Surrey", "Richmond", "Coquitlam", "Langley", "North Van"],
    href: "/regions",
  },
  {
    name: "Vancouver Island",
    tag: "Mobile Fleet",
    tagNote: "We Come to You",
    cities: ["Victoria", "Nanaimo", "Duncan", "Langford", "Courtenay"],
    href: "/regions",
  },
  {
    name: "Okanagan & Interior",
    tag: "Mobile Fleet",
    tagNote: "We Come to You",
    cities: ["Kelowna", "Penticton", "Vernon", "Kamloops", "West Kelowna"],
    href: "/regions",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand-jet">
        <video
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
         
          aria-hidden="true"
        >
          <source src="/videos/hero-mobile.mp4" data-src-desktop="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/45" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 blur-3xl" />
          <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-brand-red/4 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-red/30 to-transparent" />
        </div>

        <div className="section-container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              BC&rsquo;s Premier Wheel Refinishers
            </span>
          </div>

          <h1 className="mb-6 max-w-4xl font-display text-display-lg md:text-display-xl leading-[1.05] tracking-tight text-white">
            Setting the standard{" "}
            <br className="hidden sm:block" />
            for{" "}
            <span className="text-gradient-red">OTHERS</span> to follow.
          </h1>

          <p className="mb-10 max-w-xl font-body text-body-lg text-white/85">
            Precision wheel refinishing for dealerships, fleets, and discerning
            owners across the Lower Mainland, Vancouver Island, and Interior BC.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button
              href="/quote/estimate"
              variant="primary"
              size="lg"
              rightIcon={<IconArrowRight />}
            >
              Book an Appointment
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              See Our Services
            </Button>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
            <span className="font-body text-caption text-white/70">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-y border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-12">
          <dl className="grid grid-cols-2 gap-px bg-brand-graphite/40 overflow-hidden rounded-2xl md:grid-cols-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.value}
                className="flex flex-col items-center gap-1 bg-brand-jet-light px-6 py-8 text-center"
              >
                <dt className="font-display text-display-sm text-brand-white md:text-display-md">
                  {badge.value}
                </dt>
                <dd className="font-body text-body-sm font-semibold text-brand-smoke">
                  {badge.label}
                </dd>
                <span className="font-body text-caption text-brand-silver">
                  {badge.sublabel}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" className="py-24 bg-brand-jet">
        <div className="section-container">
          <FadeIn>
            <div className="mb-16 flex flex-col items-center gap-4 text-center">
              <div className="accent-line" aria-hidden="true" />
              <h2 className="font-display text-display-md md:text-display-lg text-brand-white">
                Why Western Wheelcraft?
              </h2>
              <p className="max-w-xl font-body text-body-lg text-brand-smoke">
                Refinishing excellence — paired with the tools,
                training, and guarantees that set us apart.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyUsCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 60}>
                <Card variant="default" padding="lg" className="h-full">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                      {card.icon}
                    </div>
                    <CardTitle className="text-display-sm">{card.title}</CardTitle>
                    <CardDescription className="text-body-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button href="/services" variant="outline" size="md" rightIcon={<IconArrowRight />}>
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* ── Our Work ── */}
      <section className="py-24 bg-brand-jet-light">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 flex flex-col items-center gap-4 text-center">
              <div className="accent-line" aria-hidden="true" />
              <h2 className="font-display text-display-md md:text-display-lg text-brand-white">
                Our Work
              </h2>
              <p className="max-w-xl font-body text-body-lg text-brand-smoke">
                Results that speak for themselves. Every wheel leaves our shop looking factory-new — or better.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <div className="relative overflow-hidden rounded-3xl aspect-[16/9] shadow-card group">
              <Image
                src="/images/before-after-porsche.jpg"
                alt="Before and after wheel refinishing on a Porsche"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-jet/60 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="font-display text-display-sm text-brand-white">Porsche — Wheel Refinishing</p>
                  <p className="font-body text-body-sm text-brand-smoke">OEM colour match · Curb rash repair</p>
                </div>
                <Button href="/services" variant="primary" size="sm" rightIcon={<IconArrowRight />}>
                  See All Services
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Region Selector ── */}
      <section id="regions" className="py-24 bg-brand-jet-light">
        <div className="section-container">
          <FadeIn>
            <div className="mb-16 flex flex-col items-center gap-4 text-center">
              <div className="accent-line" aria-hidden="true" />
              <h2 className="font-display text-display-md md:text-display-lg text-brand-white">
                We Service All of BC
              </h2>
              <p className="max-w-xl font-body text-body-lg text-brand-smoke">
                Shop service at our Burnaby facility for the Lower Mainland.
                Mobile fleet across Vancouver Island and Interior BC.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {regions.map((region, i) => (
              <FadeIn key={region.name} delay={i * 80}>
                <Link
                  href={region.href}
                  className="group relative flex flex-col rounded-2xl border border-brand-ash bg-brand-graphite p-8 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-brand-red/50 hover:shadow-red-glow/20 no-underline h-full"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-brand-red/10 px-3 py-1 font-body text-caption font-semibold text-brand-red">
                      {region.tag}
                    </span>
                    <span className="font-body text-caption text-brand-silver">{region.tagNote}</span>
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-brand-red">
                    <IconMap />
                    <h3 className="font-display text-display-sm text-brand-white group-hover:text-brand-red transition-colors duration-200">
                      {region.name}
                    </h3>
                  </div>

                  <ul className="mt-2 flex flex-wrap gap-2" role="list">
                    {region.cities.map((city) => (
                      <li
                        key={city}
                        className="rounded-md bg-brand-graphite-light px-2.5 py-1 font-body text-caption text-brand-smoke"
                      >
                        {city}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center gap-1.5 font-body text-body-sm font-semibold text-brand-red opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>Learn more</span>
                    <IconArrowRight />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA Banner ── */}
      <section id="contact" className="py-24 bg-brand-jet">
        <div className="section-container">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-brand-red/20 bg-brand-graphite px-8 py-16 text-center shadow-card md:py-20">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div className="absolute left-1/2 top-0 h-64 w-[500px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-3xl" />
              </div>

              <div className="relative">
                <div className="accent-line mx-auto mb-6" aria-hidden="true" />
                <h2 className="mb-4 font-display text-display-md md:text-display-lg text-brand-white">
                  Ready to refinish?
                </h2>
                <p className="mx-auto mb-10 max-w-lg font-body text-body-lg text-brand-smoke">
                  Call us for a same-day quote, or send us your photos and we&rsquo;ll
                  assess the damage and get back to you within a few hours.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button
                    href="tel:+16047106174"
                    variant="primary"
                    size="lg"
                    leftIcon={<IconPhone />}
                  >
                    Call 604.710.6174
                  </Button>
                  <Button href="/quote/estimate" variant="secondary" size="lg">
                    Get a Free Quote
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
