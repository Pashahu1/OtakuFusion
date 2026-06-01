import '../episode-list/Episodelist.scss';
import './WatchEpisodesSkeleton.scss';

const SKELETON_CARD_COUNT = 12;

export function WatchEpisodesSkeleton() {
  return (
    <section
      className="watch-episodes-section watch-episodes-section--loading"
      aria-busy
      aria-label="Loading episodes"
    >
      <header className="watch-episodes-section__header">
        <div className="watch-episodes-skeleton__title" />
      </header>
      <div className="watch-episodes-grid">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
          <div key={i} className="watch-episodes-skeleton__card">
            <div className="watch-episodes-skeleton__thumb" />
            <div className="watch-episodes-skeleton__line watch-episodes-skeleton__line--wide" />
            <div className="watch-episodes-skeleton__line" />
          </div>
        ))}
      </div>
    </section>
  );
}
