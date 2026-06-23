import Link from 'next/link';
import Image from 'next/image';

const footerColumns = [
  {
    title: 'Services',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'OEM Color Matching', href: '/services' },
      { label: 'Curb Rash Repair', href: '/services' },
      { label: 'Diamond Cut', href: '/services' },
      { label: 'Custom Finishes', href: '/services' },
      { label: 'Powder Coating', href: '/services' },
    ],
  },
  {
    title: 'Coverage',
    links: [
      { label: 'All Regions', href: '/regions' },
      { label: 'Lower Mainland', href: '/regions' },
      { label: 'Vancouver Island', href: '/regions' },
      { label: 'Okanagan', href: '/regions' },
      { label: 'Kelowna', href: '/regions' },
      { label: 'Kamloops', href: '/regions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Dealerships', href: '/dealerships' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { label: 'Get a Quote', href: '/quote' },
      { label: 'Book Now', href: '/booking' },
      { label: 'Trade Account', href: '/dealerships' },
    ],
  },
];

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-brand-graphite/60 bg-brand-jet-light">
      <div className="section-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
              <Image
                src="/images/logo.PNG"
                alt=""
                height={40}
                width={135}
                style={{ height: '40px', width: 'auto' }}
                className="object-contain brightness-0 invert"
              />
              <span className="font-display text-body-md tracking-tight text-brand-white">
                Western <span className="text-brand-red">Wheelcraft</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs font-body text-body-sm text-brand-silver leading-relaxed">
              BC&rsquo;s trusted wheel refinishing experts. Shop service in the Lower Mainland, mobile fleet service across Vancouver Island and Interior BC.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href="tel:+16047106174"
                className="flex items-center gap-2 font-body text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
              >
                <IconPhone /> 604.710.6174
              </a>
              <a
                href="mailto:info@westernwheelcraft.ca"
                className="flex items-center gap-2 font-body text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
              >
                <IconMail /> info@westernwheelcraft.ca
              </a>
              <span className="flex items-start gap-2 font-body text-body-sm text-brand-smoke">
                <span className="mt-0.5 shrink-0"><IconMapPin /></span>
                3756 Napier St, Burnaby BC V5C 3E5
              </span>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-display text-body-sm uppercase tracking-wider text-brand-smoke">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-body-sm text-brand-silver hover:text-brand-red transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-graphite/60 pt-8 sm:flex-row">
          <p className="font-body text-caption text-brand-silver">
            &copy; {new Date().getFullYear()} Western Wheelcraft Ltd. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-body text-caption text-brand-silver hover:text-brand-smoke transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-caption text-brand-silver hover:text-brand-smoke transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
