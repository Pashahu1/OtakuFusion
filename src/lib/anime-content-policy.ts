import { ApiError } from '@/lib/errors/ApiError';

/** AniList genre tag for explicit adult anime. */
export const BLOCKED_ANIME_GENRE = 'Hentai';

const BLOCKED_GENRE_NORMALIZED = BLOCKED_ANIME_GENRE.toLowerCase();

export interface AnimeMediaPolicyFields {
  isAdult?: boolean | null;
  genres?: string[] | null;
}

export interface AnimeInfoPolicyFields {
  adultContent?: boolean;
}

export function mediaHasBlockedGenre(genres?: string[] | null): boolean {
  if (!genres?.length) return false;
  return genres.some(
    (genre) => genre?.trim().toLowerCase() === BLOCKED_GENRE_NORMALIZED
  );
}

/**
 * Block only explicit Hentai genre — not `isAdult`, because AniList marks many
 * mainstream/seinen titles as adult without being hentai.
 */
export function isBlockedAnimeMedia(media: AnimeMediaPolicyFields): boolean {
  return mediaHasBlockedGenre(media.genres);
}

export function isBlockedAnimeInfo(
  info: AnimeInfoPolicyFields & { genres?: string[] | null }
): boolean {
  return mediaHasBlockedGenre(info.genres);
}

export function isBlockedGenreBrowseName(genreName: string): boolean {
  const normalized = genreName.trim().toLowerCase().replace(/-/g, ' ');
  return normalized === BLOCKED_GENRE_NORMALIZED;
}

export function filterAniListMediaArray<T extends AnimeMediaPolicyFields>(
  media: T[] | null | undefined
): T[] {
  if (!media?.length) return [];
  return media.filter((item) => !isBlockedAnimeMedia(item));
}

export function assertAnimeMediaAllowed(
  media: AnimeMediaPolicyFields,
  message = 'This title is not available on OtakuFusion.'
): void {
  if (isBlockedAnimeMedia(media)) {
    throw new ApiError(message, 404, 'CONTENT_BLOCKED');
  }
}
