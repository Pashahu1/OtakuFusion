import './InitialLoader.scss';
import { cn } from '@/lib/utils';

interface InitialLoaderProps {
  /** `viewport` — як при першому завантаженні; `container` — на всю висоту батька (оверлей під хедером). */
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
      <span className="loader" />
    </div>
  );
}
