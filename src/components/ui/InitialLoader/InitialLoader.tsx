import './InitialLoader.scss';
import { BrandFaviconLoader } from '@/components/ui/BrandFaviconLoader/BrandFaviconLoader';
import { cn } from '@/lib/utils';

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
      <BrandFaviconLoader />
    </div>
  );
}
