import { isBlockedAnimeMedia } from '@/lib/anime-content-policy';
import type { ScheduleAnime } from '@/shared/types/GlobalAnimeTypes';

import { anilistRequest } from './client';
import { pickTitle } from './mediaHelpers';
import type { AniListAiringPageResponse, AniListAiringScheduleItem } from './types';

export async function getAniListScheduleByDate(date: string): Promise<ScheduleAnime[]> {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  const from = Math.floor(start.getTime() / 1000);
  const to = Math.floor(end.getTime() / 1000);

  const query = `
    query ($from: Int, $to: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(
          airingAt_greater: $from
          airingAt_lesser: $to
          sort: TIME
        ) {
          episode
          airingAt
          media {
            id
            format
            isAdult
            genres
            coverImage {
              extraLarge
              large
              medium
            }
            title {
              romaji
              english
              native
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest<{ Page: AniListAiringPageResponse }>(query, {
    from,
    to,
    page: 1,
    perPage: 50,
  });

  const schedules = data.Page.airingSchedules ?? [];

  return schedules
    .filter(
      (item): item is AniListAiringScheduleItem =>
        Boolean(item.media?.id) && !isBlockedAnimeMedia(item.media ?? {}),
    )
    .map((item) => {
      const airing = new Date((item.airingAt ?? 0) * 1000);
      const pad = (value: number): string => String(value).padStart(2, '0');
      const releaseDate = `${airing.getUTCFullYear()}-${pad(airing.getUTCMonth() + 1)}-${pad(airing.getUTCDate())}`;
      const time = `${pad(airing.getUTCHours())}:${pad(airing.getUTCMinutes())}:00`;
      const media = item.media;
      const poster =
        media?.coverImage?.extraLarge ||
        media?.coverImage?.large ||
        media?.coverImage?.medium ||
        '';
      const formatRaw = media?.format?.trim();
      return {
        id: String(media?.id ?? ''),
        data_id: media?.id ?? 0,
        title: pickTitle(media?.title),
        japanese_title:
          media?.title?.native || media?.title?.romaji || pickTitle(media?.title),
        poster,
        ...(formatRaw ? { format: formatRaw } : {}),
        releaseDate,
        time,
        episode_no: item.episode ?? 0,
      };
    });
}
