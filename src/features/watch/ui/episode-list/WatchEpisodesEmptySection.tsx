'use client';

import { useTranslation } from 'react-i18next';

import { EpisodelistHeader } from './components/EpisodelistHeader';
import { WatchEpisodesEmptyState } from './WatchEpisodesEmptyState';
import './Episodelist.scss';

interface WatchEpisodesEmptySectionProps {
  message: string;
}

export function WatchEpisodesEmptySection({ message }: WatchEpisodesEmptySectionProps) {
  const { t } = useTranslation('common');

  return (
    <div className="watch-episodes-section relative flex w-full flex-col">
      <EpisodelistHeader title={t('watch.episodes')} />
      <WatchEpisodesEmptyState message={message} />
    </div>
  );
}
