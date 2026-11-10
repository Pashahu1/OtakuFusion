'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import type { HeatmapCell } from '../lib/profile-stats';
import { heatmapWeekColumns } from '../lib/profile-stats';

interface ProfileHeatmapProps {
  cells: HeatmapCell[];
}

const DAY_KEYS = [
  'daySun',
  'dayMon',
  'dayTue',
  'dayWed',
  'dayThu',
  'dayFri',
  'daySat',
] as const;
const LEGEND_LEVELS = [0, 1, 2, 3, 4, 5] as const;
const LEGEND_KEYS = [
  'legend0',
  'legend1',
  'legend2',
  'legend3',
  'legend4',
  'legend5',
] as const;

export function ProfileHeatmap({ cells }: ProfileHeatmapProps) {
  const { t } = useTranslation('common');
  const weeks = heatmapWeekColumns(cells);
  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  return (
    <section className="profile-heatmap" aria-label={t('profile.heatmapAria')}>
      <div className="profile-heatmap__header">
        <h2 className="profile-panel__title">{t('profile.activityHistory')}</h2>
      </div>

      <div className="profile-heatmap__body">
        <div className="profile-heatmap__day-labels" aria-hidden>
          {DAY_KEYS.map((key, index) => {
            const label = t(`profile.${key}`);
            return (
            <span
              key={key}
              className="profile-heatmap__day-label"
              style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden' }}
            >
              {label}
            </span>
          );
          })}
        </div>

        <div
          className="profile-heatmap__weeks"
          style={{ '--heatmap-week-count': weeks.length } as CSSProperties}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="profile-heatmap__week">
              {week.map((cell) => (
                <button
                  key={cell.dateKey}
                  type="button"
                  className={`profile-heatmap__cell profile-heatmap__cell--l${cell.level}`}
                  data-tip={t('profile.cellAria', { date: cell.dateKey, count: cell.count })}
                  aria-label={t('profile.cellAria', { date: cell.dateKey, count: cell.count })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="profile-heatmap__legend">
        <span className="profile-heatmap__legend-label">{t('profile.less')}</span>
        <div className="profile-heatmap__legend-scale">
          {LEGEND_LEVELS.map((level) => (
            <span
              key={level}
              className={`profile-heatmap__cell profile-heatmap__cell--legend profile-heatmap__cell--l${level}`}
              title={t(`profile.${LEGEND_KEYS[level]}`)}
              aria-label={t(`profile.${LEGEND_KEYS[level]}`)}
            />
          ))}
        </div>
        <span className="profile-heatmap__legend-label">{t('profile.more')}</span>
        <span className="profile-heatmap__peak">{t('profile.peak', { count: maxCount })}</span>
      </div>
    </section>
  );
}
