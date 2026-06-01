export function GenreHubSkeleton() {
  return (
    <div className="mt-[80px] animate-pulse px-4 md:px-6 lg:px-10" aria-hidden>
      <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-white/10" />
        <div className="h-9 w-40 rounded bg-white/10" />
        <div className="h-4 w-full max-w-sm rounded bg-white/5" />
      </div>
      <div className="mb-4 h-7 w-32 rounded bg-white/10" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[280px] w-[140px] shrink-0 rounded-lg bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
