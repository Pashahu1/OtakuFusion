import { redirect } from 'next/navigation';
import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { WEBSITE_NAME } from '@/config/website';
import { watchPlayPath } from '@/shared/utils/watch-routes';
import WatchSeriesPageClient from './WatchSeriesPageClient';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
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

export default async function WatchSeriesPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = id?.trim() ?? '';
  const urlEp = ep?.trim();

  if (animeId && urlEp) {
    redirect(watchPlayPath(animeId, urlEp));
  }

  return <WatchSeriesPageClient animeId={animeId} />;
}