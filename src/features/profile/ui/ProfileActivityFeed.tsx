import Image from 'next/image';
import Link from 'next/link';

import { formatActivityRelativeTime } from '../lib/profile-stats';
import type { WatchActivityEntry } from '../lib/watch-activity-log';

interface ProfileActivityFeedProps {
  activity: WatchActivityEntry[];
}

function activityTitle(entry: WatchActivityEntry): string {
  const ep =
    entry.episodeNum != null
      ? `Episode ${entry.episodeNum}`
      : `Episode ${entry.episodeId}`;
  const title = entry.title?.trim() || 'Unknown anime';
  return `Watched ${ep} · ${title}`;
}

export function ProfileActivityFeed({ activity }: ProfileActivityFeedProps) {
  return (
    <section className="profile-activity profile-panel" aria-label="Recent activity">
      <div className="profile-activity__header">
        <h2 className="profile-panel__title">Recent activity</h2>
      </div>

      {activity.length === 0 ? (
        <p className="profile-panel__empty">
          Finish an episode in the player and it will show up here.
        </p>
      ) : (
        <ul className="profile-activity__list profile-scroll">
          {activity.map((entry) => (
            <li key={`${entry.animeId}-${entry.episodeId}-${entry.watchedAt}`}>
              <Link
                href={`/watch/${entry.animeId}/play?ep=${encodeURIComponent(entry.episodeId)}`}
                className="profile-activity__item"
              >
                <div className="profile-activity__poster">
                  {entry.poster ? (
                    <Image
                      src={entry.poster}
                      alt=""
                      width={48}
                      height={68}
                      className="profile-activity__poster-img"
                      sizes="48px"
                    />
                  ) : (
                    <div className="profile-activity__poster-fallback" aria-hidden />
                  )}
                </div>
                <div className="profile-activity__content">
                  <p className="profile-activity__text">{activityTitle(entry)}</p>
                  <time
                    className="profile-activity__time"
                    dateTime={new Date(entry.watchedAt).toISOString()}
                  >
                    {formatActivityRelativeTime(entry.watchedAt)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
