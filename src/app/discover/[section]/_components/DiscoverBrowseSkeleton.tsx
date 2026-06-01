export function DiscoverBrowseSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-10 w-48 rounded bg-white/10" />
      <div className="h-4 w-full max-w-md rounded bg-white/5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}
