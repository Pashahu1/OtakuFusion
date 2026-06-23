import type { MetadataRoute } from 'next';

import { DISCOVER_NAV_SECTIONS } from '@/shared/data/discover-nav';
import { getSiteMetadataUrl } from '@/lib/site-metadata-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteMetadataUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/anime`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/schedule`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const discoverRoutes: MetadataRoute.Sitemap = DISCOVER_NAV_SECTIONS.map((item) => ({
    url: `${siteUrl}/discover/${item.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...discoverRoutes];
}
