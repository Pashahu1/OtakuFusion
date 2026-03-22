import type { ReactNode, RefObject } from 'react';

interface EpisodelistScrollAreaProps {
  listContainerRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export function EpisodelistScrollArea({
  listContainerRef,
  children,
}: EpisodelistScrollAreaProps) {
  return (
    <div
      ref={listContainerRef}
      className="episode-list__scroll h-full w-full overflow-y-auto bg-[#23252b]"
    >
      {children}
    </div>
  );
}
