import { useCallback, useEffect, useRef } from 'react';

export function useEpisodelistScroll(activeEpisodeId: string | null) {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLDivElement>(null);

  const scrollToActiveEpisode = useCallback(() => {
    if (activeEpisodeRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEpisode = activeEpisodeRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.clientHeight;
      const activeEpisodeTop = activeEpisode.getBoundingClientRect().top;
      const activeEpisodeHeight = activeEpisode.clientHeight;
      const offset = activeEpisodeTop - containerTop;
      container.scrollTop =
        container.scrollTop +
        offset -
        containerHeight / 2 +
        activeEpisodeHeight / 2;
    }
  }, []);

  useEffect(() => {
    scrollToActiveEpisode();
  }, [activeEpisodeId, scrollToActiveEpisode]);

  return { listContainerRef, activeEpisodeRef };
}
