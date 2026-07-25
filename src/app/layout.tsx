import type { Metadata, Viewport } from "next";
import { Archivo_Black, Manrope, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { LocalBusinessSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

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
    default: "Wheel Repair & Refinishing in BC | Western Wheelcraft",
    template: "%s | Western Wheelcraft",
  },
  description:
    "Professional wheel repair & refinishing from our Burnaby shop — curb rash repair, rim repair, powder coating & OEM colour matching. Mobile service across Vancouver Island & Interior BC. Free photo quotes.",
  authors: [{ name: "Western Wheelcraft Ltd." }],
  creator: "Western Wheelcraft Ltd.",
  publisher: "Western Wheelcraft Ltd.",
  metadataBase: new URL("https://westernwheelcraft.ca"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://westernwheelcraft.ca",
    siteName: "Western Wheelcraft",
    title: "Wheel Repair & Refinishing in BC | Western Wheelcraft",
    description:
      "BC's trusted wheel refinishing experts. Mobile fleet service across Lower Mainland, Vancouver Island & Interior BC.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Western Wheelcraft — Premium Wheel Refinishing",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "Western Wheelcraft — Premium Wheel Refinishing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wheel Repair & Refinishing in BC | Western Wheelcraft",
    description:
      "BC's trusted wheel refinishing experts. Mobile fleet service across Lower Mainland, Vancouver Island & Interior BC.",
    images: ["/og-image.png"],
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
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
  viewportFit: "cover",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
          <JsonLd id="local-business-schema" data={LocalBusinessSchema} />
          {GA_ID && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `}
              </Script>
              <Script id="ga4-click-tracking" strategy="afterInteractive">
                {`
                  /* ES5-safe, see video-upgrade script above for why. Delegated
                     listener catches tel:/mailto: links inside any component
                     (including ones rendered from Server Components) without
                     wiring onClick through each one individually. */
                  (function () {
                    function closestEl(el, selector) {
                      if (el.closest) { return el.closest(selector); }
                      var node = el;
                      while (node && node.nodeType === 1) {
                        if (node.matches && node.matches(selector)) { return node; }
                        node = node.parentNode;
                      }
                      return null;
                    }
                    document.addEventListener('click', function (event) {
                      if (!window.gtag) { return; }
                      var link = closestEl(event.target, 'a[href^="tel:"]');
                      if (link) {
                        window.gtag('event', 'phone_click', { link_url: link.getAttribute('href') });
                        return;
                      }
                      link = closestEl(event.target, 'a[href^="mailto:"]');
                      if (link) {
                        window.gtag('event', 'email_click', { link_url: link.getAttribute('href') });
                      }
                    });
                  })();
                `}
              </Script>
            </>
          )}
          <Script id="video-upgrade" strategy="afterInteractive">
            {`
              /* ES5-safe: this inline script is NOT transpiled, so it must avoid
                 arrow functions, optional chaining, const/let, and NodeList.forEach
                 to run on older Safari/Android/Chrome without throwing. */
              (function () {
                function toArray(list) {
                  var arr = [];
                  for (var i = 0; i < list.length; i++) { arr.push(list[i]); }
                  return arr;
                }

                /* Closest fallback for very old browsers */
                function closestEl(el, selector) {
                  if (el.closest) { return el.closest(selector); }
                  var node = el;
                  while (node && node.nodeType === 1) {
                    if (node.matches && node.matches(selector)) { return node; }
                    node = node.parentNode;
                  }
                  return null;
                }

                /* Swap mobile -> desktop source on larger screens (better quality) */
                function upgradeVideoSources() {
                  if (typeof window === 'undefined' || window.innerWidth < 768) { return; }
                  var sources = toArray(document.querySelectorAll('source[data-src-desktop]'));
                  for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    var desktop = source.getAttribute('data-src-desktop');
                    if (desktop) { source.setAttribute('src', desktop); }
                    var video = closestEl(source, 'video');
                    if (video && video.readyState === 0 && video.load) { video.load(); }
                  }
                }
                upgradeVideoSources();
                if (window.addEventListener) {
                  window.addEventListener('resize', upgradeVideoSources);
                }

                /* Attempt autoplay; if blocked, reveal the play button */
                function safePlay(video) {
                  try {
                    var p = video.play();
                    if (p && typeof p.then === 'function') { return p; }
                  } catch (e) {}
                  return null;
                }

                function initVideoAutoplay() {
                  var videos = toArray(document.querySelectorAll('video'));
                  for (var i = 0; i < videos.length; i++) {
                    (function (video) {
                      var section = closestEl(video, 'section');
                      var playBtn = section ? section.querySelector('.video-play-btn') : null;
                      var p = safePlay(video);
                      if (p && p['catch']) {
                        p['catch'](function () {
                          if (!playBtn) { return; }
                          playBtn.style.opacity = '1';
                          playBtn.style.pointerEvents = 'auto';
                          playBtn.addEventListener('click', function () {
                            safePlay(video);
                            playBtn.style.display = 'none';
                          });
                        });
                      }
                    })(videos[i]);
                  }
                }

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initVideoAutoplay);
                } else {
                  initVideoAutoplay();
                }
              })();
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
