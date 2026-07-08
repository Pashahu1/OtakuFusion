'use client';

import { EpisodelistHeader } from './components/EpisodelistHeader';
import { WatchEpisodesEmptyState } from './WatchEpisodesEmptyState';
import './Episodelist.scss';

interface WatchEpisodesEmptySectionProps {
  message: string;
}

export function WatchEpisodesEmptySection({ message }: WatchEpisodesEmptySectionProps) {
  return (
    <div className="watch-episodes-section relative flex w-full flex-col">
      <EpisodelistHeader title="Episodes" />
      <WatchEpisodesEmptyState message={message} />
    </div>
  );
}
