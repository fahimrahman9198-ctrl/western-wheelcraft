'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Regions', href: '/regions' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Dealerships', href: '/dealerships' },
];

function IconPhone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-graphite/60 bg-brand-jet/90 backdrop-blur-md">
      <div className="section-container flex h-24 items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Western Wheelcraft — mobile wheel refinishing experts"
            height={80}
            width={240}
            style={{ height: '80px', width: 'auto' }}
            className="object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3.5 py-2 text-body-sm transition-colors duration-200',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'bg-brand-graphite text-brand-white'
                  : 'text-brand-smoke hover:bg-brand-graphite hover:text-brand-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/quote/estimate" variant="primary" size="sm" rightIcon={<IconPhone />}>
            Get a Quote
          </Button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-smoke hover:bg-brand-graphite hover:text-brand-white transition-colors md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-graphite/60 bg-brand-jet/95 backdrop-blur-md md:hidden">
          <nav className="section-container flex flex-col gap-1 py-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3.5 py-3 text-body-sm transition-colors duration-200',
                  pathname === link.href
                    ? 'bg-brand-graphite text-brand-white'
                    : 'text-brand-smoke hover:bg-brand-graphite hover:text-brand-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-brand-graphite/40 pt-3">
              <Button href="/booking" variant="secondary" size="md" className="w-full justify-center">
                Book Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
