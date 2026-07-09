import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { WEBSITE_NAME } from '@/config/website';
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
    const title = results.data?.title ?? 'Watch Anime';
    const epLabel = episode ? ` E${episode}` : '';
    return {
      title: `Watch ${title}${epLabel} — ${WEBSITE_NAME}`,
    };
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