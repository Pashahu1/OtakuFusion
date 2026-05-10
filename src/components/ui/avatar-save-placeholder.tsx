import { cn } from '@/lib/utils';

interface AvatarSavePlaceholderProps {
  /** Розмір сторони квадрата / діаметра кола (px). */
  sizePx: number;
  className?: string;
}

/** Круглий скелетон для слоту аватара (оверлей під час збереження). */
export function AvatarSavePlaceholder({
  sizePx,
  className,
}: AvatarSavePlaceholderProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'shrink-0 animate-pulse rounded-full bg-white/15',
        className,
      )}
      style={{ width: sizePx, height: sizePx }}
    />
  );
}
