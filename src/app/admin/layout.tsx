import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | WW Admin',
    default: 'Admin | Western Wheelcraft',
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
