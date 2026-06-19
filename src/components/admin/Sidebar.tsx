'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignOutButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  FileQuestion,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/lib/admin-auth';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Leads', href: '/admin/leads', icon: FileQuestion },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Invoices', href: '/admin/invoices', icon: FileText },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  adminUser: AdminUser;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ adminUser, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-brand-graphite px-5">
        <Image
          src="/images/logo.PNG"
          alt=""
          height={36}
          width={120}
          style={{ height: '36px', width: 'auto' }}
          className="object-contain brightness-0 invert"
        />
        <div className="flex flex-col">
          <span className="font-display text-[0.8rem] tracking-tight text-brand-white">
            Western <span className="text-brand-red">Wheelcraft</span>
          </span>
          <span className="font-mono text-[0.6rem] text-brand-silver uppercase tracking-wider">Admin</span>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-red text-white'
                  : 'text-brand-silver hover:bg-brand-graphite hover:text-brand-white'
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-white' : 'text-brand-ash group-hover:text-brand-white'
                )}
              />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-brand-graphite p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white font-display text-sm">
            {adminUser.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-brand-white truncate">
              {adminUser.displayName}
            </p>
            <p className="text-caption text-brand-silver capitalize">{adminUser.role}</p>
          </div>
          <SignOutButton redirectUrl="/admin/login">
            <button
              title="Sign out"
              className="ml-auto rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-red transition-colors"
            >
              <LogOut size={15} />
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-brand-graphite bg-brand-jet-light h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-brand-graphite bg-brand-jet-light lg:hidden flex">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
