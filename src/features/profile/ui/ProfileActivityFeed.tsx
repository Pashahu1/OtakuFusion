'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { formatActivityRelativeTime } from '../lib/profile-stats';
import type { WatchActivityEntry } from '../lib/watch-activity-log';

interface ProfileActivityFeedProps {
  activity: WatchActivityEntry[];
}

export function ProfileActivityFeed({ activity }: ProfileActivityFeedProps) {
  const { t } = useTranslation('common');

  return (
    <section className="profile-activity profile-panel" aria-label={t('profile.activityAria')}>
      <div className="profile-activity__header">
        <h2 className="profile-panel__title">{t('profile.activity')}</h2>
      </div>

      {activity.length === 0 ? (
        <p className="profile-panel__empty">{t('profile.activityEmpty')}</p>
      ) : (
        <ul className="profile-activity__list profile-scroll">
          {activity.map((entry) => {
            const title = entry.title?.trim() || t('profile.unknownAnime');

            return (
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
                  <p className="profile-activity__text">
                    <span className="profile-activity__verb">
                      {entry.episodeNum != null
                        ? t('profile.watchedEpisode', { num: entry.episodeNum })
                        : t('profile.watchedAnEpisode')}{' '}
                    </span>
                    <span className="profile-activity__title">{title}</span>
                  </p>
                  <time
                    className="profile-activity__time"
                    dateTime={new Date(entry.watchedAt).toISOString()}
                  >
                    {formatActivityRelativeTime(entry.watchedAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
