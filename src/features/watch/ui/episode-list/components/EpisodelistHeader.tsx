import type { ReactNode } from 'react';

interface EpisodelistHeaderProps {
  children?: ReactNode;
  title?: string;
}

export function EpisodelistHeader({ children, title }: EpisodelistHeaderProps) {
  const isSeries = title != null;
  return (
    <header
      className={
        isSeries
          ? 'watch-episodes-section__header flex flex-col gap-3 px-0 py-0'
          : 'sticky top-0 z-10 flex flex-col gap-3 border-b border-white/10 bg-[#23252b] px-3 py-4'
      }
    >
      <h2
        className={
          isSeries
            ? 'text-title text-brand-text-primary m-0'
            : 'text-[15px] font-bold text-white'
        }
      >
        {title ?? 'List of episodes:'}
      </h2>
      {children ? (
        <div className="flex min-w-0 flex-col gap-2.5">{children}</div>
      ) : null}
    </header>
  );
}
