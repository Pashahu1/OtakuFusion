import type { ReactNode } from 'react';

interface EpisodelistHeaderProps {
  children?: ReactNode;
}

export function EpisodelistHeader({ children }: EpisodelistHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-white/10 bg-[#23252b] px-3 py-4">
      <h2 className="text-[15px] font-bold text-white">
        List of episodes:
      </h2>
      {children ? (
        <div className="flex min-w-0 flex-col gap-2.5">{children}</div>
      ) : null}
    </header>
  );
}
