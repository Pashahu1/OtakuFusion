import type { ReactNode, RefObject } from 'react';

interface EpisodelistScrollAreaProps {
  listContainerRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
}

export function EpisodelistScrollArea({
  listContainerRef,
  children,
  className,
}: EpisodelistScrollAreaProps) {
  return (
    <div
      ref={listContainerRef}
      className={
        className ??
        'episode-list__scroll h-full w-full overflow-y-auto bg-[#23252b]'
      }
    >
      {children}
    </div>
  );
}
