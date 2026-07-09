import './InitialLoader.scss';
import { cn } from '@/lib/utils';

interface LoaderSpinnerProps {
  className?: string;
}

/** Shared spinner markup — use inside overlays or via `InitialLoader`. */
export function LoaderSpinner({ className }: LoaderSpinnerProps) {
  return <span className={cn('loader', className)} aria-hidden />;
}

interface InitialLoaderProps {
  /** `viewport` — like first page load; `container` — full parent height (overlay under header). */
  variant?: 'viewport' | 'container';
  className?: string;
}

export function InitialLoader({
  variant = 'viewport',
  className,
}: InitialLoaderProps) {
  return (
    <div
      className={cn(
        'loader-wrapper',
        variant === 'container' && 'loader-wrapper--container',
        className,
      )}
    >
      <LoaderSpinner />
    </div>
  );
}
