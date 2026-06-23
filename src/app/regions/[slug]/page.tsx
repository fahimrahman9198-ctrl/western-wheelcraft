import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/FadeIn';
import { REGIONS, REGION_SLUGS } from '@/lib/region-data';
import { LocalBusinessSchema } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return REGION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const region = REGIONS[params.slug as keyof typeof REGIONS];

  if (!region) return {};

  return {
    title: `${region.name} Wheel Refinishing | Western Wheelcraft`,
    description: `${region.description} Professional wheel refinishing and repair services.`,
    openGraph: {
      title: `${region.name} Wheel Refinishing`,
      description: region.shortDescription,
      type: 'website',
    },
  };
}

function IconMapPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

export default async function RegionPage(props: PageProps) {
  const params = await props.params;
  const region = REGIONS[params.slug as keyof typeof REGIONS];

  if (!region) {
    notFound();
  }

  const regionBusinessSchema = {
    ...LocalBusinessSchema,
    name: region.localBusiness.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: region.localBusiness.address.split(',')[0],
      addressLocality: region.name,
      addressRegion: region.province,
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: region.localBusiness.lat,
      longitude: region.localBusiness.lng,
    },
  };

  return (
    <>
      <Script
        id="region-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(regionBusinessSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-28">
        <Image
          src="/images/hero-brand.jpg"
          alt={`Western Wheelcraft wheel refinishing services in ${region.name}, BC`}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-brand-jet/80" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/4 blur-3xl" />
        </div>
        <div className="section-container relative">
          <div className="max-w-2xl">
            <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-brand-white">
              Wheel Refinishing in {region.name}
            </h1>
            <p className="mb-8 max-w-lg font-body text-body-lg text-brand-smoke">
              {region.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" variant="primary" size="lg">
                Get a Free Quote
              </Button>
              <Button href="tel:+16047106174" variant="secondary" size="lg">
                Call {region.localBusiness.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Service Areas</h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-body-lg text-brand-smoke">
                We serve {region.name} and surrounding communities
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {region.serviceAreas.map((area, i) => (
              <FadeIn key={area} delay={i * 60}>
                <div className="rounded-xl border border-brand-graphite bg-brand-graphite p-4 text-center">
                  <p className="font-body text-body-md text-brand-white">{area}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-brand-jet py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">Contact & Hours</h2>
            </div>
          </FadeIn>
          <FadeIn delay={60}>
            <div className="mx-auto max-w-2xl rounded-2xl border border-brand-graphite bg-brand-graphite p-8 shadow-card">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <IconMapPin />
                  <div>
                    <p className="font-display text-body-lg text-brand-white font-semibold">{region.localBusiness.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <IconPhone />
                  <p className="font-body text-body-lg text-brand-smoke">{region.localBusiness.phone}</p>
                </div>
                <div className="flex items-start gap-4">
                  <IconClock />
                  <p className="font-body text-body-lg text-brand-smoke">{region.localBusiness.hours}</p>
                </div>
              </div>
              <div className="mt-8 border-t border-brand-graphite-light pt-8">
                <Button href="tel:+16047106174" variant="primary" size="lg" className="w-full">
                  Schedule Service
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <FadeIn>
            <div className="mb-12 text-center">
              <div className="accent-line mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-display text-display-md text-brand-white">What {region.name} Customers Say</h2>
            </div>
          </FadeIn>
          <div className="grid gap-5 md:grid-cols-2">
            {region.testimonials.map((testimonial, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex flex-col rounded-2xl border border-brand-graphite bg-brand-graphite p-7 shadow-card h-full">
                  <div className="mb-4 text-brand-red">
                    <IconQuote />
                  </div>
                  <p className="mb-6 flex-1 font-body text-body-md italic text-brand-smoke leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="border-t border-brand-graphite-light pt-4">
                    <p className="font-display text-body-sm text-brand-white">{testimonial.author}</p>
                    <p className="font-body text-caption text-brand-red">{testimonial.role}</p>
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
