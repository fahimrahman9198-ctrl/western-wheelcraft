import Image from 'next/image';
import Link from 'next/link';

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-jet px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Western Wheelcraft"
            height={52}
            width={175}
            style={{ height: '52px', width: 'auto' }}
            className="object-contain"
          />
          <p className="font-mono text-caption uppercase tracking-widest text-brand-smoke">
            Admin Portal
          </p>
        </div>

        <div className="rounded-lg border border-brand-ash bg-brand-graphite p-8 shadow-card">
          <h1 className="font-display text-display-sm text-brand-white">Access denied</h1>
          <p className="mt-3 text-body-sm text-brand-smoke">
            This Clerk account is signed in, but it has not been granted a Western Wheelcraft
            admin role.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-lg bg-brand-red px-4 py-3 font-display text-body-sm text-white transition-colors hover:bg-brand-red-hover"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
