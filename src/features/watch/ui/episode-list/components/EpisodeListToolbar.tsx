import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EpisodeListToolbarProps {
  children: ReactNode;
  className?: string;
}

export function EpisodeListToolbar({ children, className }: EpisodeListToolbarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-3 md:gap-4 max-[1200px]:justify-between">
        {children}
      </div>
    </div>
  );
}
