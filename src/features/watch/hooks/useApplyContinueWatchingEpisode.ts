import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import { useEffect } from 'react';
import { findContinueWatchingEntry } from '@/features/watch/lib/resolve-continue-watching-cta';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

function episodeNumFromSavedEntry(episodeId: string, episodeNum?: number): string {
  if (episodeNum != null && Number.isFinite(episodeNum)) return String(episodeNum);
  return getEpisodeNumberFromId(episodeId) ?? episodeId;
}

export function useApplyContinueWatchingEpisode(
  urlEp: string | undefined,
  episodes: EpisodesTypes[] | null,
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void,
) {
  useEffect(() => {
    if (urlEp?.trim() || !episodes?.length || hasAppliedSavedEpisodeRef.current) return;
    if (typeof window === 'undefined') return;

    hasAppliedSavedEpisodeRef.current = true;
    const found = findContinueWatchingEntry(readContinueWatchingList(), animeId);
    if (!found) return;

    const targetNum = episodeNumFromSavedEntry(found.episodeId, found.episodeNum);
    const match = episodes.find((ep) => episodeMatchesSelection(ep, targetNum));
    if (!match) return;

    const resolved = getEpisodeNumberFromId(match.id) ?? String(match.episode_no);
    if (resolved) setEpisodeId(resolved);
  }, [animeId, episodes, setEpisodeId, urlEp, hasAppliedSavedEpisodeRef]);
}
