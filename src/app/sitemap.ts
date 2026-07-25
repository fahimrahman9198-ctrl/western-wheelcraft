import type { MetadataRoute } from 'next';
import { REGION_SLUGS } from '@/lib/region-data';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://westernwheelcraft.ca';

// Public, indexable pages only. Transactional/form pages (quote estimate,
// booking wizard/checkout/success, admin, dealer portal) are intentionally
// excluded and also carry noindex metadata.
const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/regions', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/quote', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/booking', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/dealerships', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const regionEntries = REGION_SLUGS.map((slug) => ({
    url: `${BASE_URL}/regions/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const blogEntries = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...regionEntries, ...blogEntries];
}
