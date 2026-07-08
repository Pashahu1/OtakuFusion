'use client';

import { CalendarClock } from 'lucide-react';
import { EmptyState } from '@/components/ui/states/EmptyState';
import './WatchEpisodesEmptyState.scss';

interface WatchEpisodesEmptyStateProps {
  message: string;
}

export function WatchEpisodesEmptyState({ message }: WatchEpisodesEmptyStateProps) {
  return (
    <EmptyState
      plain
      title="Episodes not available yet"
      message={message}
      icon={<CalendarClock className="watch-episodes-empty__icon" aria-hidden />}
    />
  );
}
