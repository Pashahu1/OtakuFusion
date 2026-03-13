import website_name from '@/config/website';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface WatchInfoSeoInformationProps {
  title: string | null | undefined;
}

export function WatchInfoSeoInformation({
  title,
}: WatchInfoSeoInformationProps) {
  if (!title) {
    return (
      <div className="flex min-w-0 flex-col gap-2 max-[575px]:hidden">
        <Skeleton className="h-[145px] w-full max-w-[510px] shrink-0" />
      </div>
    );
  }

  return (
    <p className="shrink-0 text-[14px] max-[575px]:hidden">
      {`${website_name} is the best site to watch `}
      <span className="font-bold">{title}</span>
      {` SUB online, or you can even watch `}
      <span className="font-bold">{title}</span>
      {` DUB in HD quality.`}
    </p>
  );
}
