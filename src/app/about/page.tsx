import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Western Wheelcraft Ltd. — a family-owned BC wheel refinishing company since 1989. Red Seal certified, ICBC accredited, I-CAR trained.',
};

function IconAward() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
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

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const certifications = [
  {
    icon: <IconAward />,
    title: 'Red Seal Certified',
    description:
      "Our lead technicians hold the Interprovincial Red Seal — Canada's highest trade certification for automotive refinishing.",
  },
  {
    icon: <IconShield />,
    title: 'ICBC Accredited',
    description:
      "Accredited repair facility for ICBC claims. We work directly with the insurer so you don't have to.",
  },
  {
    icon: <IconAward />,
    title: 'I-CAR Certified',
    description:
      'Industry training and certification through I-CAR, the standard for collision repair and refinishing excellence.',
  },
  {
    icon: <IconShield />,
    title: '12-Month Warranty',
    description:
      'All refinishing work is backed by a 12-month workmanship warranty. If our finish fails, we fix it — full stop.',
  },
];

const team = [
  { name: 'Lead Refinisher', role: 'Red Seal Certified', years: '18 years with WWC' },
  { name: 'Fleet Technician', role: 'Mobile Unit Specialist', years: '9 years with WWC' },
  { name: 'Colour Matching Lead', role: 'OEM Specialist', years: '12 years with WWC' },
  { name: 'Account Manager', role: 'Fleet & Dealerships', years: '6 years with WWC' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-brand-red/4 blur-3xl" />
        </div>
        <div className="section-container relative">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
              <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
                Est. 1989 · Burnaby, BC
              </span>
            </div>
            <h1 className="mb-5 font-display text-display-lg md:text-display-xl text-brand-white">
              35+ years setting the standard
            </h1>
            <p className="mb-8 font-body text-body-lg text-brand-smoke max-w-lg">
              Family-owned and BC-based. We started refinishing wheels when most shops
              didn&rsquo;t — and we&rsquo;ve been raising the bar ever since.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/services" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
                Our Services
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-10">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '1989', label: 'Founded' },
              { value: '35+', label: 'Years in Business' },
              { value: '50,000+', label: 'Wheels Refinished' },
              { value: '3', label: 'Service Regions' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="font-display text-display-sm md:text-display-md text-brand-white">{stat.value}</dt>
                <dd className="font-body text-body-sm text-brand-silver">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Our Story */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <FadeIn>
              <div>
                <div className="accent-line mb-5" aria-hidden="true" />
                <h2 className="mb-5 font-display text-display-md text-brand-white">Our Story</h2>
                <div className="flex flex-col gap-4 font-body text-body-md text-brand-smoke">
                  <p>
                    Western Wheelcraft was founded in 1989 in Burnaby, BC. What started as a
                    single-bay operation has grown into BC&rsquo;s most trusted wheel refinishing
                    company — with a shop at 3756 Napier St and mobile fleet units serving
                    Vancouver Island and Interior BC.
                  </p>
                  <p>
                    We&rsquo;ve always been family-owned and operated. That means every wheel
                    that comes through our shop is treated with the same care as if it were
                    on our own car. No shortcuts, no compromises.
                  </p>
                  <p>
                    Over three decades, we&rsquo;ve become the preferred refinishing partner
                    for BC&rsquo;s leading dealerships, fleet operators, and discerning private
                    owners — from daily drivers to rare exotics.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="relative overflow-hidden rounded-3xl aspect-[4/3] shadow-card group">
                <Image
                  src="/images/wheel-detail.jpg"
                  alt="Western Wheelcraft workshop — precision wheel refinishing"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Our Certifications</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                We don&rsquo;t just say we&rsquo;re the best — we prove it with the certifications
                that matter most in our industry.
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.title} delay={i * 70}>
                <Card variant="default" padding="lg" className="h-full">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                      {cert.icon}
                    </div>
                    <CardTitle className="text-body-lg">{cert.title}</CardTitle>
                    <CardDescription className="text-body-sm leading-relaxed">
                      {cert.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Two service models */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">How We Serve BC</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                Two distinct service models — built for the geography and needs of our customers.
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-2">
            <FadeIn delay={80}>
              <div className="rounded-3xl border border-brand-graphite bg-brand-graphite p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                  <IconBuilding />
                </div>
                <div className="mb-2 inline-flex items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Shop Service
                </div>
                <h3 className="mb-3 font-display text-display-sm text-brand-white">Lower Mainland</h3>
                <p className="mb-5 font-body text-body-md text-brand-smoke">
                  Customers in the Lower Mainland visit our Burnaby facility at 3756 Napier
                  St. Drop off your wheels or your vehicle — our shop handles the rest.
                </p>
                <ul className="flex flex-col gap-2">
                  {['Full workshop with professional equipment', 'Same-day turnaround on most repairs', 'Wheel balancing & TPMS service available', 'ICBC accredited repair facility'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-body-sm text-brand-silver">
                      <span className="shrink-0 text-success"><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={160}>
              <div className="rounded-3xl border border-brand-ash/50 bg-brand-graphite p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                  <IconTruck />
                </div>
                <div className="mb-2 inline-flex items-center rounded-full bg-brand-graphite-light px-3 py-1 font-body text-caption font-semibold text-brand-smoke">
                  Mobile Fleet Service
                </div>
                <h3 className="mb-3 font-display text-display-sm text-brand-white">Island & Interior BC</h3>
                <p className="mb-5 font-body text-body-md text-brand-smoke">
                  Vancouver Island and Interior BC customers get our mobile fleet — a
                  fully equipped service truck that comes to your location on a scheduled route.
                </p>
                <ul className="flex flex-col gap-2">
                  {['Vancouver Island: Victoria, Nanaimo, Duncan', 'Okanagan: Penticton, Vernon & area', 'Dedicated Kelowna service days', 'Kamloops & Thompson-Nicola region'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-body-sm text-brand-silver">
                      <span className="shrink-0 text-success"><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Our Team</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                Decades of combined experience. Every technician is trained, certified, and passionate about wheels.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <div className="relative mb-8 overflow-hidden rounded-3xl aspect-[16/7] shadow-card group">
              <Image
                src="/images/team.jpg"
                alt="The Western Wheelcraft team"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-jet/50 via-transparent to-transparent" aria-hidden="true" />
            </div>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <FadeIn key={member.name} delay={i * 70}>
                <div className="rounded-2xl border border-brand-graphite bg-brand-graphite p-5">
                  <h3 className="font-display text-body-md text-brand-white">{member.name}</h3>
                  <p className="font-body text-body-sm text-brand-red">{member.role}</p>
                  <p className="mt-1 font-body text-caption text-brand-silver">{member.years}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-jet py-16">
        <div className="section-container text-center">
          <FadeIn>
            <h2 className="mb-4 font-display text-display-sm md:text-display-md text-brand-white">
              Ready to work with us?
            </h2>
            <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
              Drop in, call, or send photos. We&rsquo;ll have a quote to you within a few hours.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button href="/quote/estimate" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
                Get a Free Quote
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
