'use client';

import type { CSSProperties } from 'react';

import type { HeatmapCell } from '../lib/profile-stats';
import { heatmapWeekColumns } from '../lib/profile-stats';

interface ProfileHeatmapProps {
  cells: HeatmapCell[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cellTip(cell: HeatmapCell): string {
  const label = cell.count === 1 ? 'episode' : 'episodes';
  return `${cell.dateKey}: ${cell.count} ${label}`;
}

export function ProfileHeatmap({ cells }: ProfileHeatmapProps) {
  const weeks = heatmapWeekColumns(cells);
  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  return (
    <section className="profile-heatmap" aria-label="Daily watch activity">
      <div className="profile-heatmap__header">
        <h2 className="profile-panel__title">Activity</h2>
        <span className="profile-heatmap__hint">Episodes per day · last year</span>
      </div>

      <div className="profile-heatmap__body">
        <div className="profile-heatmap__day-labels" aria-hidden>
          {DAY_LABELS.map((label, index) => (
            <span
              key={label}
              className="profile-heatmap__day-label"
              style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden' }}
            >
              {label}
            </span>
          ))}
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
                    data-tip={cellTip(cell)}
                    aria-label={`${cell.dateKey}, ${cell.count} episodes watched`}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>

      <div className="profile-heatmap__legend">
        <span className="profile-heatmap__legend-label">Less</span>
        <div className="profile-heatmap__legend-scale">
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`profile-heatmap__cell profile-heatmap__cell--legend profile-heatmap__cell--l${level}`}
              aria-hidden
            />
          ))}
        </div>
        <span className="profile-heatmap__legend-label">More</span>
        <span className="profile-heatmap__peak">
          Peak day: {maxCount} ep.
        </span>
      </div>
    </section>
  );
}
