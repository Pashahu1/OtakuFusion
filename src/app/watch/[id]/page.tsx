import { redirect } from 'next/navigation';
import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { WEBSITE_NAME } from '@/config/website';
import { buildWatchPageMetadata } from '@/features/watch/lib/build-watch-page-metadata';
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
    const data = results.data;
    return buildWatchPageMetadata({
      title: data?.title ?? 'Anime',
      description: data?.animeInfo?.Overview,
      poster: data?.poster,
    });
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