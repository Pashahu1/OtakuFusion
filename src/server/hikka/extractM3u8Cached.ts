import { unstable_cache } from 'next/cache';
import { extractM3u8FromEmbedPage } from '@/services/hikka/extractPageM3u8';

export async function extractHikkaM3u8Cached(pageUrl: string): Promise<string | null> {
  const key = pageUrl.trim();
  if (!key.startsWith('http')) return null;
  const cached = unstable_cache(
    async () => extractM3u8FromEmbedPage(key),
    ['hikka-m3u8', key],
    { revalidate: 900, tags: ['hikka-m3u8', key] }
  );
  return cached();
}
