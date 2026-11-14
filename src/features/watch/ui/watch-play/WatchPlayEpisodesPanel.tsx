'use client';

import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { WatchPlaybackLanguages } from '@/features/watch/lib/watch-availability';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { WatchEpisodeGrid } from '@/features/watch/ui/shared/WatchEpisodeGrid';
import './WatchPlayEpisodesPanel.scss';

interface WatchPlayEpisodesPanelProps {
  open: boolean;
  onClose: () => void;
  animeId: string;
  episodes: EpisodesTypes[];
  currentEpisodeId: string | null;
  seriesTitle: string;
  languages: WatchPlaybackLanguages;
  posterUrl: string;
  episodeDuration: string | null;
  watchedEpisodes: Record<string, boolean>;
  onSelectEpisode: (episodeId: string) => void;
  seasonLabel?: string;
}

export function WatchPlayEpisodesPanel({
  open,
  onClose,
  animeId,
  episodes,
  currentEpisodeId,
  seriesTitle,
  languages,
  posterUrl,
  episodeDuration,
  watchedEpisodes,
  onSelectEpisode,
  seasonLabel,
}: WatchPlayEpisodesPanelProps) {
  const { t } = useTranslation('common');
  const resolvedSeasonLabel = seasonLabel ?? t('watch.season', { n: 1 });
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const frame = window.requestAnimationFrame(() => {
      const active = scrollRef.current?.querySelector<HTMLElement>(
        '.watch-episode-card--now-playing, .watch-episode-card--active',
      );
      active?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, currentEpisodeId]);

  if (!open) return null;

  return (
    <div className="watch-play-episodes-panel" role="presentation">
      <button
        type="button"
        className="watch-play-episodes-panel__backdrop"
        aria-label={t('watch.closeEpisodes')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="watch-play-episodes-panel__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="watch-play-episodes-panel__handle" aria-hidden />
        <header className="watch-play-episodes-panel__header">
          <div className="watch-play-episodes-panel__heading">
            {seriesTitle ? (
              <p className="watch-play-episodes-panel__kicker">{seriesTitle}</p>
            ) : null}
            <h2 id={titleId} className="watch-play-episodes-panel__title">
              {resolvedSeasonLabel}
            </h2>
            <p className="watch-play-episodes-panel__meta">
              {t('watch.episode', { count: episodes.length })}
            </p>
          </div>
          <button
            type="button"
            className="watch-play-episodes-panel__close"
            onClick={onClose}
            aria-label={t('actions.close')}
          >
            <X size={20} strokeWidth={2.25} aria-hidden />
          </button>
        </header>
        <div ref={scrollRef} className="watch-play-episodes-panel__scroll">
          <WatchEpisodeGrid
            className="watch-play-episodes-panel__grid"
            animeId={animeId}
            episodes={episodes}
            currentEpisodeId={currentEpisodeId}
            watchedEpisodes={watchedEpisodes}
            posterUrl={posterUrl}
            seriesTitle={seriesTitle}
            languages={languages}
            episodeDuration={episodeDuration}
            showNowPlayingBadge
            onSelectEpisode={(episodeId) => {
              onSelectEpisode(episodeId);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
