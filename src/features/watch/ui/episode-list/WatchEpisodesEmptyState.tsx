'use client';

import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/states/EmptyState';
import './WatchEpisodesEmptyState.scss';

interface WatchEpisodesEmptyStateProps {
  message: string;
}

export function WatchEpisodesEmptyState({ message }: WatchEpisodesEmptyStateProps) {
  const { t } = useTranslation('common');

  return (
    <EmptyState
      plain
      title={t('watch.episodesUnavailable')}
      message={message}
      icon={<CalendarClock className="watch-episodes-empty__icon" aria-hidden />}
    />
  );
}
