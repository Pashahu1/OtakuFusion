'use client';

import { Star } from 'lucide-react';

interface WatchSeriesRatingRowProps {
  scorePercent?: number;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function WatchSeriesRatingRow({ scorePercent }: WatchSeriesRatingRowProps) {
  const score = clampScore(scorePercent ?? 0);
  if (score <= 0) return null;

  const stars5 = score / 20;
  const fullStars = Math.floor(stars5);
  const hasHalf = stars5 - fullStars >= 0.35 && fullStars < 5;
  const displayRating = (score / 10).toFixed(1);

  return (
    <div className="watch-series-rating">
      <div className="watch-series-rating__stars" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < fullStars;
          const half = i === fullStars && hasHalf;
          return (
            <Star
              key={i}
              className={
                filled
                  ? 'watch-series-rating__star watch-series-rating__star--full'
                  : half
                    ? 'watch-series-rating__star watch-series-rating__star--half'
                    : 'watch-series-rating__star'
              }
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <p className="watch-series-rating__text">
        Average Rating: <strong>{displayRating}</strong>
        <span className="watch-series-rating__muted"> ({score}%)</span>
      </p>
    </div>
  );
}
