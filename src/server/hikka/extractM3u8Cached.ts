import { unstable_cache } from 'next/cache';
import { extractM3u8FromEmbedPage } from '@/lib/catalog/providers/hikka/extractPageM3u8';

export async function extractHikkaM3u8Cached(pageUrl: string): Promise<string | null> {
  const key = pageUrl.trim();
  if (!key.startsWith('http')) return null;

  const cached = unstable_cache(
    async () => {
      const url = await extractM3u8FromEmbedPage(key);
      // Do not cache misses — otherwise 15 min of broken Ukrainian after parser fix
      if (!url) throw new Error('hikka_m3u8_miss');
      return url;
    },
    ['hikka-m3u8-v2', key],
    { revalidate: 900, tags: ['hikka-m3u8', key] }
  );

  try {
    return await cached();
  } catch (e) {
    if (e instanceof Error && e.message === 'hikka_m3u8_miss') return null;
    throw e;
  }
}
