import { cn } from '@/lib/utils';

interface AvatarSavePlaceholderProps {
  /** Square side / circle diameter size (px). */
  sizePx: number;
  className?: string;
}

/** Round skeleton for avatar slot (overlay while saving). */
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
