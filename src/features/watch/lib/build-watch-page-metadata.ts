import type { Metadata } from 'next';
import { isUkrainianDubOnlyPlayback } from '@/features/watch/lib/watch-availability';

interface BuildWatchPageMetadataInput {
  title: string;
  description?: string;
  poster?: string;
  episodeLabel?: string;
}

export function buildWatchPageMetadata({
  title,
  description,
  poster,
  episodeLabel,
}: BuildWatchPageMetadataInput): Metadata {
  const baseTitle = episodeLabel ? `Watch ${title}${episodeLabel}` : `Watch ${title}`;
  const pageTitle = isUkrainianDubOnlyPlayback()
    ? `${baseTitle} · Ukrainian Dub`
    : `${baseTitle} · Sub/Dub`;
  const trimmedDescription = description?.trim().slice(0, 200);
  const posterUrl = poster?.trim();
  const images = posterUrl
    ? [{ url: posterUrl, alt: `${title} poster` }]
    : undefined;

  return {
    title: pageTitle,
    description: trimmedDescription || undefined,
    openGraph: {
      title: pageTitle,
      description: trimmedDescription || undefined,
      type: 'video.tv_show',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: trimmedDescription || undefined,
      images: posterUrl ? [posterUrl] : undefined,
    },
  };
}
