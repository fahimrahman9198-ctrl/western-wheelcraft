import type { Metadata } from 'next';
import { FadeIn } from '@/components/ui/FadeIn';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Western Wheelcraft. Visit our Burnaby shop at 3756 Napier St, or request mobile fleet service for Vancouver Island and Interior BC.',
};

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 3h15v13H1V3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 -top-20 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/5 blur-3xl" />
        </div>
        <div className="section-container relative text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            <span className="font-body text-caption font-semibold uppercase tracking-widest text-brand-red">
              Shop · Mobile Fleet · Trade Enquiries
            </span>
          </div>
          <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-brand-white">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-xl font-body text-body-lg text-brand-smoke">
            Whether you&rsquo;re visiting our Burnaby shop or requesting mobile fleet service —
            we&rsquo;ll get back to you within a few hours.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-brand-jet-light py-16">
        <div className="section-container">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                <div className="rounded-3xl border border-brand-ash bg-brand-graphite p-8 md:p-10">
                  <h2 className="mb-2 font-display text-display-sm text-brand-white">Send Us a Message</h2>
                  <p className="mb-8 font-body text-body-sm text-brand-silver">
                    Select your region so we can direct your request to the right team.
                  </p>
                  <ContactForm />
                </div>
              </FadeIn>
            </div>

            {/* Business info */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <FadeIn delay={80}>
                <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-7">
                  <h3 className="mb-5 font-display text-body-lg text-brand-white">Burnaby Shop</h3>
                  <div className="flex flex-col gap-4">
                    <a
                      href="tel:+16047106174"
                      className="flex items-center gap-3 font-body text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                        <IconPhone />
                      </span>
                      <div>
                        <span className="block font-semibold text-brand-white">604.710.6174</span>
                        <span className="text-brand-silver">Call or text</span>
                      </div>
                    </a>
                    <a
                      href="mailto:info@westernwheelcraft.ca"
                      className="flex items-center gap-3 font-body text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                        <IconMail />
                      </span>
                      <div>
                        <span className="block font-semibold text-brand-white">info@westernwheelcraft.ca</span>
                        <span className="text-brand-silver">Include photos if possible</span>
                      </div>
                    </a>
                    <div className="flex items-start gap-3 font-body text-body-sm text-brand-smoke">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                        <IconMapPin />
                      </span>
                      <div>
                        <span className="block font-semibold text-brand-white">3756 Napier St</span>
                        <span className="text-brand-silver">Burnaby BC V5C 3E5</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 font-body text-body-sm text-brand-smoke">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                        <IconClock />
                      </span>
                      <div>
                        <span className="block font-semibold text-brand-white">Mon–Sat 9am–5pm</span>
                        <span className="text-brand-silver">Sun 12pm–4:30pm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={140}>
                {/* Map placeholder */}
                <div className="overflow-hidden rounded-2xl border border-brand-ash bg-brand-graphite">
                  <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-brand-graphite to-brand-graphite-light">
                    <div className="absolute inset-0 opacity-20">
                      {/* Grid lines simulating map */}
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#3A3A42" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                    <div className="relative text-center px-6">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-white shadow-red-glow">
                        <IconMapPin />
                      </div>
                      <p className="font-display text-body-sm text-brand-white">3756 Napier St</p>
                      <p className="font-body text-caption text-brand-silver">Burnaby, BC</p>
                    </div>
                  </div>
                  <div className="px-5 py-3">
                    <a
                      href="https://maps.google.com/?q=3756+Napier+St,+Burnaby+BC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-body-sm font-semibold text-brand-red hover:text-brand-white transition-colors"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 p-5">
                  <div className="mb-2 flex items-center gap-2 text-brand-red">
                    <IconTruck />
                    <span className="font-display text-body-sm text-brand-white">Mobile Fleet Regions</span>
                  </div>
                  <p className="font-body text-body-sm text-brand-smoke leading-relaxed">
                    For Vancouver Island, Okanagan, Kelowna, and Kamloops — our team
                    travels to you. Use this form to request a quote and we&rsquo;ll confirm
                    your next available service date.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
