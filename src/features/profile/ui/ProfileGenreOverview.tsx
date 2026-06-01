import type { CSSProperties } from 'react';

import type { GenreStat } from '../lib/profile-stats';

interface ProfileGenreOverviewProps {
  genres: GenreStat[];
}

export function ProfileGenreOverview({ genres }: ProfileGenreOverviewProps) {
  const total = genres.reduce((sum, g) => sum + g.count, 0);

  if (genres.length === 0) {
    return (
      <section className="profile-genres profile-panel" aria-label="Genre overview">
        <h2 className="profile-panel__title">Genres</h2>
        <p className="profile-panel__empty">
          Watch a few episodes to see your genre breakdown.
        </p>
      </section>
    );
  }

  return (
    <section className="profile-genres profile-panel" aria-label="Genre overview">
      <h2 className="profile-panel__title">Genres</h2>

      <div className="profile-genres__tags">
        {genres.map((genre) => (
          <div
            key={genre.name}
            className="profile-genres__tag"
            style={{ '--genre-color': genre.color } as CSSProperties}
          >
            <span className="profile-genres__tag-name">{genre.name}</span>
            <span className="profile-genres__tag-count">
              {genre.count} {genre.count === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        ))}
      </div>

      <div className="profile-genres__bar" role="img" aria-label="Genre distribution">
        {genres.map((genre) => (
          <span
            key={genre.name}
            className="profile-genres__bar-segment"
            style={{
              width: `${(genre.count / total) * 100}%`,
              backgroundColor: genre.color,
            }}
          />
        ))}
      </div>
    </section>
  );
}
