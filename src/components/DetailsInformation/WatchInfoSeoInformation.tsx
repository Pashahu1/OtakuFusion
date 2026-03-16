import { WEBSITE_NAME } from '@/config/website';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface WatchInfoSeoInformationProps {
  title: string | null | undefined;
}

export function WatchInfoSeoInformation({
  title,
}: WatchInfoSeoInformationProps) {
  if (!title) {
    return (
      <div className="flex min-w-0 max-w-[510px] flex-col gap-2 max-[575px]:hidden">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[85%]" />
      </div>
    );
  }

  return (
    <p className="shrink-0 text-[14px] max-[575px]:hidden">
      {`${WEBSITE_NAME} is the best site to watch `}
      <span className="font-bold">{title}</span>
      {` SUB online, or you can even watch `}
      <span className="font-bold">{title}</span>
      {` DUB in HD quality.`}
    </p>
  );
}
