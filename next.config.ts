import type { NextConfig } from "next";

// Baseline security headers applied to every response. Content-Security-Policy
// is deliberately omitted here: the site loads Clerk, Google Analytics, and an
// inline video script, so a CSP needs a Report-Only rollout to avoid silently
// breaking them. These headers are safe to apply unconditionally.
const securityHeaders = [
  // Force HTTPS for two years. No `preload` — that commits the domain to the
  // browser preload list, which is hard to reverse. includeSubDomains only
  // affects browser HTTP, not the Google Workspace MX/mail records.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Stop browsers from MIME-sniffing a response into a different content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow the site being framed by other origins (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send only the origin (not the full path) on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny powerful features the site does not use. File upload uses <input
  // type="file">, which does not require the camera permission.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
