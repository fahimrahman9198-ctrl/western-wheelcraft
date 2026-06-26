import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Regions',
  description:
    'Western Wheelcraft serves the Lower Mainland from our Burnaby shop, and provides mobile fleet service across Vancouver Island, Okanagan, Kelowna, and Kamloops.',
};

function IconBuilding() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4h6v4M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mobileRegions = [
  {
    name: 'Vancouver Island',
    tag: 'Mobile Fleet',
    description: 'Regular service routes covering the full island, from Victoria to Campbell River.',
    cities: ['Victoria', 'Saanich', 'Langford', 'Duncan', 'Nanaimo', 'Parksville', 'Courtenay'],
  },
  {
    name: 'Okanagan',
    tag: 'Mobile Fleet',
    description: 'Serving the broader Okanagan wine and orchard region with scheduled fleet routes.',
    cities: ['Penticton', 'Vernon', 'West Kelowna', 'Summerland', 'Oliver', 'Osoyoos'],
  },
  {
    name: 'Kelowna',
    tag: 'Mobile Fleet',
    description: 'Dedicated service days in Kelowna — our highest-demand Interior BC location.',
    cities: ['Downtown Kelowna', 'Rutland', 'Lake Country', 'Peachland', 'Westbank'],
  },
  {
    name: 'Kamloops',
    tag: 'Mobile Fleet',
    description: 'Scheduled visits to Kamloops and the surrounding Thompson-Nicola region.',
    cities: ['Kamloops', 'Sun Peaks', 'Chase', 'Barriere', 'Merritt'],
  },
];

export default function RegionsPage() {
  return (
    <>
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
          <source src="/videos/regions-hero-mobile.mp4" data-src-desktop="/videos/regions-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/45" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-3xl" />
        </div>
        <div className="section-container relative text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              Service Coverage
            </span>
          </div>
          <h1 className="mb-5 font-display text-display-lg md:text-display-xl text-white">
            Serving British Columbia<br className="hidden sm:block" /> from Coast to Interior
          </h1>
          <p className="mx-auto mb-8 max-w-xl font-body text-body-lg text-white/85">
            Shop service at our Burnaby facility for the Lower Mainland. Mobile fleet
            service for Vancouver Island and Interior BC — we come to you.
          </p>
        </div>
      </section>

      {/* Service model explainer strip */}
      <div className="border-y border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-12">
            <div className="flex items-center gap-3 font-body text-body-sm text-brand-smoke">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-graphite text-brand-red">
                <IconBuilding />
              </span>
              <span><strong className="text-brand-white">Shop Service</strong> — Lower Mainland</span>
            </div>
            <div className="hidden h-5 w-px bg-brand-ash sm:block" aria-hidden="true" />
            <div className="flex items-center gap-3 font-body text-body-sm text-brand-smoke">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-graphite text-brand-red">
                <IconTruck />
              </span>
              <span><strong className="text-brand-white">Mobile Fleet</strong> — Island & Interior BC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section A — Shop Service */}
      <section className="bg-brand-jet py-20">
        <div className="section-container">
          <FadeIn>
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                <IconBuilding />
              </div>
              <div>
                <p className="font-body text-caption uppercase tracking-widest text-brand-red font-semibold">Shop Service</p>
                <h2 className="font-display text-display-sm md:text-display-md text-brand-white">
                  Lower Mainland — Visit Our Shop
                </h2>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="overflow-hidden rounded-3xl border border-brand-red/20 bg-brand-graphite shadow-card">
              <div className="grid md:grid-cols-2">
                {/* Info */}
                <div className="p-8 md:p-10">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red px-3 py-1.5 font-body text-caption font-bold text-white">
                    <IconBuilding />
                    Drop-Off Service
                  </div>
                  <h3 className="mb-1 font-display text-display-sm text-brand-white">Vancouver Mainland</h3>
                  <p className="mb-6 font-body text-body-md text-brand-smoke leading-relaxed">
                    Customer brings wheels or vehicle to our Burnaby facility. Professional
                    workshop with full alignment, balancing, and TPMS service available.
                    Same-day and next-day turnaround on most jobs.
                  </p>

                  <div className="mb-6 flex flex-col gap-3">
                    <div className="flex items-start gap-3 font-body text-body-sm text-brand-smoke">
                      <span className="mt-0.5 shrink-0 text-brand-red"><IconMapPin /></span>
                      <div>
                        <strong className="text-brand-white block">3756 Napier St, Burnaby BC V5C 3E5</strong>
                        <span className="text-brand-silver">Just off Hastings St near Boundary Rd</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-body text-body-sm text-brand-smoke">
                      <span className="text-brand-red"><IconClock /></span>
                      Mon–Sat 9am–5pm &nbsp;·&nbsp; Sun 12–4:30pm
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      href="https://maps.google.com/?q=3756+Napier+St,+Burnaby+BC"
                      variant="primary"
                      size="md"
                      rightIcon={<IconExternalLink />}
                    >
                      Get Directions
                    </Button>
                    <Button href="/booking" variant="secondary" size="md">
                      Book Drop-Off
                    </Button>
                  </div>
                </div>

                {/* Cities */}
                <div className="border-t border-brand-graphite-light md:border-l md:border-t-0 p-8 md:p-10">
                  <h4 className="mb-4 font-display text-body-md text-brand-white">Cities We Serve</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Vancouver', 'Burnaby', 'Surrey', 'Richmond',
                      'Coquitlam', 'Port Coquitlam', 'Langley', 'North Vancouver',
                      'West Vancouver', 'Delta', 'New Westminster', 'Abbotsford',
                      'White Rock', 'Pitt Meadows', 'Maple Ridge',
                    ].map((city) => (
                      <span
                        key={city}
                        className="rounded-lg bg-brand-graphite-light px-3 py-1.5 font-body text-caption text-brand-smoke"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 font-body text-caption text-brand-silver">
                    Not in this list? Call us — if you&rsquo;re in the Lower Mainland we likely serve your area.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section B — Mobile Fleet */}
      <section className="bg-brand-jet-light py-20">
        <div className="section-container">
          <FadeIn>
            <div className="relative mb-10 overflow-hidden rounded-3xl aspect-[21/9] shadow-card group">
              <Image
                src="/images/fleet-van.jpg"
                alt="Western Wheelcraft mobile fleet service van"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-jet/70 via-brand-jet/20 to-transparent" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center p-8 md:p-12">
                <div>
                  <span className="mb-3 inline-flex items-center rounded-full bg-brand-red px-3 py-1.5 font-body text-caption font-bold text-white">
                    Mobile Fleet Service
                  </span>
                  <p className="font-display text-display-sm md:text-display-md text-brand-white">
                    We Come to You
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                <IconTruck />
              </div>
              <div>
                <p className="font-body text-caption uppercase tracking-widest text-brand-red font-semibold">Mobile Fleet Service</p>
                <h2 className="font-display text-display-sm md:text-display-md text-brand-white">
                  Mobile Fleet — We Come to You
                </h2>
              </div>
            </div>
            <p className="mb-10 max-w-2xl font-body text-body-lg text-brand-smoke">
              Our fully equipped mobile units bring premium refinishing to your driveway,
              dealership, or commercial yard — across Vancouver Island and Interior BC.
            </p>
          </FadeIn>

          <div className="grid gap-5 sm:grid-cols-2">
            {mobileRegions.map((region, i) => (
              <FadeIn key={region.name} delay={i * 80}>
                <div className="group flex flex-col rounded-2xl border border-brand-ash bg-brand-graphite p-7 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-red-glow/10 h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-display-sm text-brand-white group-hover:text-brand-red transition-colors duration-200">
                      {region.name}
                    </h3>
                    <span className="rounded-full bg-brand-red/10 px-3 py-1 font-body text-caption font-semibold text-brand-red">
                      {region.tag}
                    </span>
                  </div>
                  <p className="mb-4 font-body text-body-sm text-brand-smoke leading-relaxed flex-1">
                    {region.description}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {region.cities.map((city) => (
                      <span
                        key={city}
                        className="rounded-md bg-brand-graphite-light px-2.5 py-1 font-body text-caption text-brand-smoke"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                  <Button href="/contact" variant="outline" size="sm" rightIcon={<IconArrowRight />}>
                    Book in This Region
                  </Button>
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
              Ready to book your region?
            </h2>
            <p className="mx-auto mb-8 max-w-md font-body text-body-lg text-brand-smoke">
              Tell us where you are and what you need — we&rsquo;ll confirm availability and schedule your service.
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
