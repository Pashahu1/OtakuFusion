import './AnimeCardSkeleton.scss';

export function AnimeCardSkeleton() {
  return (
    <div className="anime-card-skeleton" aria-hidden>
      <div className="anime-card-skeleton__poster animate-pulse" />
      <div className="anime-card-skeleton__footer">
        <div className="anime-card-skeleton__line anime-card-skeleton__line--title animate-pulse" />
        <div className="anime-card-skeleton__line anime-card-skeleton__line--sub animate-pulse" />
      </div>
    </div>
  );
}
