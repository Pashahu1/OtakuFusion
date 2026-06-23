import type { MetadataRoute } from 'next';

import { getSiteMetadataUrl } from '@/lib/site-metadata-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteMetadataUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/profile/', '/auth/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
