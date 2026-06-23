import type { MetadataRoute } from 'next';

const BASE_URL = 'https://westernwheelcraft.ca';

// Public, indexable pages only. Transactional/form pages (quote estimate,
// booking wizard/checkout/success, admin, dealer portal) are intentionally
// excluded and also carry noindex metadata.
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/regions', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/quote', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/booking', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/dealerships', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
