export function AnimeCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2" aria-hidden>
      <div className="aspect-[2/3] w-full rounded-lg bg-white/6" />
      <div className="h-3.5 w-[88%] rounded bg-white/10" />
      <div className="h-3 w-[60%] rounded bg-white/5" />
    </div>
  );
}
