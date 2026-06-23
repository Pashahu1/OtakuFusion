/** Canonical site origin for robots, sitemap, and Open Graph (no trailing slash). */
export function getSiteMetadataUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return 'https://otaku-fusion.vercel.app';
}
