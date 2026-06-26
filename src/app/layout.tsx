import type { Metadata, Viewport } from "next";
import { Archivo_Black, Manrope, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { LocalBusinessSchema, OrganizationSchema } from "@/lib/structured-data";
import { getAggregateRatingSchema } from "@/lib/reviews";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Western Wheelcraft | Premium Wheel Refinishing",
    template: "%s | Western Wheelcraft",
  },
  description:
    "Western Wheelcraft Ltd. — BC's trusted wheel refinishing experts. Curb-rash repair, scratch & gouge refinishing, custom finishes, and OEM color matching. Mobile fleet service across Lower Mainland, Vancouver Island & Interior BC.",
  keywords: [
    "wheel refinishing",
    "curb rash repair",
    "wheel repair Vancouver",
    "OEM color matching",
    "custom wheel finish",
    "mobile wheel repair",
    "Western Wheelcraft",
    "Burnaby wheel repair",
    "Victoria wheel repair",
  ],
  authors: [{ name: "Western Wheelcraft Ltd." }],
  creator: "Western Wheelcraft Ltd.",
  publisher: "Western Wheelcraft Ltd.",
  metadataBase: new URL("https://westernwheelcraft.ca"),
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://westernwheelcraft.ca",
    siteName: "Western Wheelcraft",
    title: "Western Wheelcraft | Premium Wheel Refinishing",
    description:
      "BC's trusted wheel refinishing experts. Mobile fleet service across Lower Mainland, Vancouver Island & Interior BC.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Western Wheelcraft — Premium Wheel Refinishing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Western Wheelcraft | Premium Wheel Refinishing",
    description:
      "BC's trusted wheel refinishing experts. Mobile fleet service across Lower Mainland, Vancouver Island & Interior BC.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    { media: "(prefers-color-scheme: light)", color: "#0A0A0B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en-CA"
        className={`${archivoBlack.variable} ${manrope.variable} ${jetbrainsMono.variable} dark`}
        suppressHydrationWarning
      >
        <head>
          <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(OrganizationSchema) }}
          />
          <Script
            id="local-business-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(LocalBusinessSchema) }}
          />
          <Script
            id="aggregate-rating-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(getAggregateRatingSchema()) }}
          />
          <Script id="video-upgrade" strategy="beforeInteractive">
            {`
              function upgradeVideoSources() {
                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                  document.querySelectorAll('source[data-src-desktop]').forEach(source => {
                    source.src = source.dataset.srcDesktop;
                    const video = source.closest('video');
                    if (video && video.readyState === 0) video.load();
                  });
                }
              }
              upgradeVideoSources();
              window.addEventListener('resize', upgradeVideoSources);

              // Force video autoplay on mobile, show play button if blocked
              function initVideoAutoplay() {
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      const video = entry.target;
                      const section = video.closest('section');
                      const playBtn = section?.querySelector('.video-play-btn');

                      video.play().catch(() => {
                        // Autoplay blocked, show play button
                        if (playBtn) {
                          playBtn.style.opacity = '1';
                          playBtn.style.pointerEvents = 'auto';
                        }
                        document.addEventListener('touchstart', () => {
                          video.play().catch(() => {});
                          if (playBtn) playBtn.style.display = 'none';
                        }, { once: true });
                      });
                    }
                  });
                }, { threshold: 0.25 });

                document.querySelectorAll('video').forEach(v => observer.observe(v));
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initVideoAutoplay);
              } else {
                initVideoAutoplay();
              }
            `}
          </Script>
        </head>
        <body className="min-h-screen bg-brand-jet text-brand-white antialiased flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
