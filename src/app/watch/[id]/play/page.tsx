import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { WEBSITE_NAME } from '@/config/website';
import { buildWatchPageMetadata } from '@/features/watch/lib/build-watch-page-metadata';
import WatchPlayPageClient from './WatchPlayPageClient';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = id?.trim() ?? '';
  const episode = ep?.trim();
  try {
    const { results } = await getWatchAnimeCatalogMeta(animeId);
    const data = results.data;
    const epLabel = episode ? ` E${episode}` : '';
    return buildWatchPageMetadata({
      title: data?.title ?? 'Anime',
      description: data?.animeInfo?.Overview,
      poster: data?.poster,
      episodeLabel: epLabel,
    });
  } catch {
    return { title: `Watch — ${WEBSITE_NAME}` };
  }
}

export default async function WatchPlayPage({ params }: PageProps) {
  const { id } = await params;
  const animeId = id?.trim() ?? '';

  return (
    <Suspense fallback={<div className="watch-play-page" aria-busy aria-label="Loading player" />}>
      <WatchPlayPageClient animeId={animeId} />
    </Suspense>
  );
}