'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-jet px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Western Wheelcraft"
            height={52}
            width={175}
            style={{ height: '52px', width: 'auto' }}
            className="object-contain"
          />
          <p className="font-mono text-caption text-brand-smoke uppercase tracking-widest">
            Admin Portal
          </p>
        </div>

        <SignIn
          routing="path"
          path="/admin/login"
          forceRedirectUrl="/admin"
          appearance={{
            variables: {
              colorPrimary: '#D81E2A',
              colorBackground: '#111114',
              colorInput: '#1E1E22',
              colorInputForeground: '#F5F5F7',
              colorForeground: '#F5F5F7',
              colorMutedForeground: '#A1A1AA',
              borderRadius: '0.5rem',
            },
            elements: {
              cardBox: 'shadow-none',
              card: 'border border-brand-ash bg-brand-graphite shadow-card',
              headerTitle: 'font-display text-brand-white',
              headerSubtitle: 'text-brand-smoke',
              socialButtonsBlockButton: 'border-brand-ash bg-brand-graphite-light text-brand-white',
              formButtonPrimary: 'bg-brand-red hover:bg-brand-red-hover',
              footerAction: 'hidden',
            },
          }}
        />
      </div>
    </div>
  );
}
