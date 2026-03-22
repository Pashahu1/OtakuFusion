import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { useEffect } from 'react';

export function usePlayerColumnHeightSync(
  playerColumnRef: React.RefObject<HTMLDivElement | null>,
  setEpisodesColumnHeight: (height: number | null) => void,
  streamUrl: string | null,
  serverLoading: boolean,
  buffering: boolean,
  nextEpisodeSchedule: NextEpisodeScheduleResult | null
) {
  useEffect(() => {
    const centerColumn = playerColumnRef.current;
    if (!centerColumn) return;

    const updateHeight = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth > 1200) {
        const h = centerColumn.clientHeight;
        setEpisodesColumnHeight(h > 0 ? h : null);
      } else {
        setEpisodesColumnHeight(null);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateHeight);
      ro.observe(centerColumn);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', updateHeight);
      };
    }
    return () => window.removeEventListener('resize', updateHeight);
  }, [
    setEpisodesColumnHeight,
    streamUrl,
    serverLoading,
    buffering,
    nextEpisodeSchedule?.nextEpisodeSchedule,
  ]);
}
