import type { MetadataRoute } from 'next';

const BASE_URL = 'https://westernwheelcraft.ca';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/quote/estimate',
          '/quote/checkout',
          '/quote/success',
          '/booking/wizard',
          '/booking/checkout',
          '/booking/success',
          '/dealerships/portal',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
