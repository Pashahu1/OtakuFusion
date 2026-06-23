import './AnimeCardSkeleton.scss';

export function AnimeCardSkeleton() {
  return (
    <div className="anime-card-skeleton" aria-hidden>
      <div className="anime-card-skeleton__poster" />
      <div className="anime-card-skeleton__footer">
        <div className="anime-card-skeleton__line anime-card-skeleton__line--title" />
        <div className="anime-card-skeleton__line anime-card-skeleton__line--sub" />
      </div>
    </div>
  );
}
