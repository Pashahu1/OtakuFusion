import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { formatUpNextCard } from '@/features/player/lib/format-up-next-episode-label';
import { LIST_THUMBNAIL_RES, thumbnailUrl } from '@/shared/utils/thumbnail-url';

import type { UpNextOverlayModel } from './attachUpNextOverlay';

export function buildUpNextOverlayModel(
  episode: EpisodesTypes,
  poster: string | null | undefined,
): UpNextOverlayModel {
  const card = formatUpNextCard(episode);
  const imageSource = poster?.trim() ?? '';
  return {
    title: card.title,
    subtitle: card.subtitle,
    imageUrl: imageSource ? thumbnailUrl(imageSource, LIST_THUMBNAIL_RES) : null,
  };
}
