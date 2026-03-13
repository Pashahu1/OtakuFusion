import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface WatchInfoOverviewProps {
  overview: string | null | undefined;
  isFullOverview: boolean;
  setIsFullOverview: (value: boolean) => void;
}

export function WatchInfoOverview({
  overview,
  isFullOverview,
  setIsFullOverview,
}: WatchInfoOverviewProps) {
  if (overview === null) {
    return (
      <div className="mt-2 flex min-w-0 flex-col gap-2">
        <Skeleton className="h-[350px] w-full max-w-[510px] shrink-0" />
      </div>
    );
  }
  return (
    <div className="mt-0 max-h-[200px] min-w-0 overflow-hidden">
      <div className="no-scrollbar mt-2 max-h-[160px] overflow-y-auto">
        <p className="text-[14px] font-[400]">
          {overview && overview.length > 270 ? (
            <>
              {isFullOverview ? overview : `${overview.slice(0, 270)}...`}
              <span
                className="text-[13px] font-bold hover:cursor-pointer"
                onClick={() => setIsFullOverview(!isFullOverview)}
              >
                {isFullOverview ? '- Less' : '+ More'}
              </span>
            </>
          ) : (
            <span>{overview}</span>
          )}
        </p>
      </div>
    </div>
  );
}
