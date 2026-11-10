'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import {
  countToStatLevel,
  milestoneScale,
  type HeatmapLevel,
  type ProfileStatsSummary,
} from '../lib/profile-stats';

interface ProfileStatsCardsProps {
  stats: ProfileStatsSummary;
}

const PRIMARY_STATS = [
  { key: 'totalAnime', labelKey: 'profile.totalAnime' },
  { key: 'daysWatched', labelKey: 'profile.daysWatched' },
  { key: 'episodesWatched', labelKey: 'profile.episodesWatched' },
] as const;

function formatStatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

function paletteVar(level: HeatmapLevel): string {
  if (level === 0) return '#71717a';
  return `var(--palette-${level})`;
}

export function ProfileStatsCards({ stats }: ProfileStatsCardsProps) {
  const { t } = useTranslation('common');
  const scale = milestoneScale(stats.episodesWatched);
  const meterColor = paletteVar(countToStatLevel(stats.episodesWatched));

  return (
    <section className="profile-stats profile-panel" aria-label={t('profile.statsAria')}>
      <div className="profile-stats__row">
        {PRIMARY_STATS.map(({ key, labelKey }) => (
          <article
            key={key}
            className="profile-stats__stat"
            style={
              {
                '--stat-color': paletteVar(countToStatLevel(stats[key])),
              } as CSSProperties
            }
          >
            <span className="profile-stats__value">
              {formatStatValue(stats[key])}
            </span>
            <span className="profile-stats__label">{t(labelKey)}</span>
          </article>
        ))}
      </div>

      <div
        className="profile-stats__meter"
        role="img"
        aria-label={t('profile.meterAria', {
          current: stats.episodesWatched,
          max: scale.max,
        })}
      >
        <div className="profile-stats__meter-track">
          <span
            className="profile-stats__meter-fill"
            data-empty={scale.percent === 0 ? 'true' : undefined}
            style={
              {
                '--meter-percent': `${scale.percent}%`,
                '--meter-color': meterColor,
              } as CSSProperties
            }
          />
        </div>
        <div className="profile-stats__meter-ticks">
          {scale.ticks.map((tick) => (
            <span
              key={tick}
              className="profile-stats__meter-tick"
              style={
                {
                  '--tick-percent': `${(tick / scale.max) * 100}%`,
                } as CSSProperties
              }
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      <p className="profile-stats__meta">
        <span>{t('profile.streak', { count: stats.currentStreak })}</span>
        {stats.favoritesCount > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span>{t('profile.favorite', { count: stats.favoritesCount })}</span>
          </>
        ) : null}
      </p>
    </section>
  );
}
