'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { login, isAuthenticated } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/admin');
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (login(username, password)) {
      router.replace('/admin');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-jet px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/logo.PNG"
            alt="Western Wheelcraft"
            height={52}
            width={175}
            style={{ height: '52px', width: 'auto' }}
            className="object-contain brightness-0 invert"
          />
          <p className="font-mono text-caption text-brand-silver uppercase tracking-widest">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-graphite bg-brand-jet-light p-8 shadow-card">
          <h1 className="mb-6 font-display text-display-sm text-brand-white">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-brand-smoke">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-silver" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-brand-graphite bg-brand-graphite py-2.5 pl-10 pr-4 text-body-sm text-brand-white placeholder-brand-silver outline-none ring-0 transition-colors focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-brand-smoke">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-silver" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-brand-graphite bg-brand-graphite py-2.5 pl-10 pr-10 text-body-sm text-brand-white placeholder-brand-silver outline-none ring-0 transition-colors focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-smoke transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-body-sm text-brand-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-brand-red px-4 py-3 font-display text-body-sm text-white transition-colors hover:bg-brand-red-hover disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-caption text-brand-silver">
          Demo mode — no real authentication
        </p>
      </div>
    </div>
  );
}
