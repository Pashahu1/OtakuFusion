import { useMemo } from 'react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

interface UseWatchStreamOverlayInput {
  playerShellPending: boolean;
  streamBuffering: boolean;
  streamUrl: string | null;
  streamResolveAttempted: boolean;
  streamHardExhausted: boolean;
  catalogError: string | null | undefined;
  episodes: EpisodesTypes[] | null;
  totalEpisodes: number;
}

export function useWatchStreamOverlay({
  playerShellPending,
  streamBuffering,
  streamUrl,
  streamResolveAttempted,
  streamHardExhausted,
  catalogError,
  episodes,
  totalEpisodes,
}: UseWatchStreamOverlayInput) {
  const streamOverlayMessage = useMemo((): { title: string; subtitle: string } | null => {
    if (playerShellPending || streamBuffering || streamUrl) return null;

    const catalogErr = catalogError?.trim();
    if (catalogErr) {
      return {
        title: 'Could not load this title.',
        subtitle: catalogErr,
      };
    }

    if (!streamResolveAttempted) return null;

    if (streamHardExhausted) {
      return {
        title: 'Playback could not be started.',
        subtitle:
          'You may have hit a temporary rate limit from switching stream sources, or the streaming server is unavailable. Please wait and try again, or pick another episode.',
      };
    }

    return {
      title: 'This player is currently unavailable.',
      subtitle:
        'Please try another episode, change server or provider, or try again later.',
    };
  }, [
    playerShellPending,
    streamBuffering,
    streamUrl,
    streamResolveAttempted,
    streamHardExhausted,
    catalogError,
  ]);

  const episodesForUi = streamHardExhausted ? [] : episodes;
  const totalEpisodesForUi = streamHardExhausted ? 0 : totalEpisodes;

  return { streamOverlayMessage, episodesForUi, totalEpisodesForUi };
}
