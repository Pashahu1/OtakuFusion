import type { ProfileStatsSummary } from '../lib/profile-stats';

interface ProfileStatsCardsProps {
  stats: ProfileStatsSummary;
}

const STAT_ITEMS = [
  { key: 'totalAnime', label: 'Anime watched' },
  { key: 'daysWatched', label: 'Days active (daily count)' },
  { key: 'episodesWatched', label: 'Episodes watched' },
  { key: 'currentStreak', label: 'Day streak' },
] as const;

function formatStatValue(
  key: (typeof STAT_ITEMS)[number]['key'],
  stats: ProfileStatsSummary,
): string {
  const value = stats[key];
  if (key === 'episodesWatched' && value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

export function ProfileStatsCards({ stats }: ProfileStatsCardsProps) {
  return (
    <section className="profile-stats profile-panel" aria-label="Watch statistics">
      <div className="profile-stats__grid">
        {STAT_ITEMS.map(({ key, label }) => (
          <article key={key} className="profile-stats__card">
            <span className="profile-stats__value">
              {formatStatValue(key, stats)}
            </span>
            <span className="profile-stats__label">{label}</span>
          </article>
        ))}
      </div>
      {stats.favoritesCount > 0 ? (
        <p className="profile-stats__footnote">
          {stats.favoritesCount} saved{' '}
          {stats.favoritesCount === 1 ? 'favorite' : 'favorites'}
        </p>
      ) : null}
    </section>
  );
}
