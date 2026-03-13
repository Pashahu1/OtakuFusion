import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface WatchInfoTitleProps {
  title: string | null | undefined;
}

export function WatchInfoTitle({ title }: WatchInfoTitleProps) {
  if (!title) {
    return (
      <Skeleton className="h-[26px] max-w-[180px] min-w-[120px] shrink-0 max-[500px]:h-[20px] max-[500px]:min-w-[80px]" />
    );
  }

  return (
    <p className="shrink-0 text-[26px] leading-6 font-medium max-[500px]:text-[18px]">
      {title}
    </p>
  );
}
