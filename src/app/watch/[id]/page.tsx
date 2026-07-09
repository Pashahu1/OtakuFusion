import WatchSeriesPageClient from './WatchSeriesPageClient';
import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { WEBSITE_NAME } from '@/config/website';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const animeId = id?.trim() ?? '';
  try {
    const { results } = await getWatchAnimeCatalogMeta(animeId);
    const title = results.data?.title ?? 'Watch Anime';
    return {
      title: `Watch ${title} — ${WEBSITE_NAME}`,
      description: results.data?.animeInfo?.Overview?.slice(0, 160) ?? undefined,
    };
  } catch {
    return { title: `Watch — ${WEBSITE_NAME}` };
  }
}

export default async function WatchSeriesPage({params}: PageProps) {
  const { id } = await params;
  const animeId = id?.trim() ?? '';

  return <WatchSeriesPageClient animeId={animeId} />
}

