'use client';
export function AnimeCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2">
      <div className="aspect-[2/3] w-full bg-neutral-800 rounded-lg" />
      <div className="h-[14px] w-[80%] bg-neutral-800 rounded-md" />
      <div className="h-[12px] w-[60%] bg-neutral-800 rounded-md" />
    </div>
  );
}
