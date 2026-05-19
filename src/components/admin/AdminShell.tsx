'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { isAuthenticated } from '@/lib/admin-auth';
import { Toaster } from 'sonner';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-jet">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-graphite border-t-brand-red" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-jet">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="flex h-14 items-center gap-3 border-b border-brand-graphite bg-brand-jet-light px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-body-sm text-brand-white">
            Western <span className="text-brand-red">Wheelcraft</span>
          </span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1E1E22',
            border: '1px solid #2A2A30',
            color: '#F5F5F7',
          },
        }}
      />
    </div>
  );
}
