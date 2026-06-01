'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { WatchEpisodeGrid } from '@/features/watch/ui/shared/WatchEpisodeGrid';
import './WatchPlayEpisodesPanel.scss';

interface WatchPlayEpisodesPanelProps {
  open: boolean;
  onClose: () => void;
  episodes: EpisodesTypes[];
  currentEpisodeId: string | null;
  seriesTitle: string;
  posterUrl: string;
  episodeDuration: string | null;
  watchedEpisodes: Record<string, boolean>;
  onSelectEpisode: (episodeId: string) => void;
  seasonLabel?: string;
}

export function WatchPlayEpisodesPanel({
  open,
  onClose,
  episodes,
  currentEpisodeId,
  seriesTitle,
  posterUrl,
  episodeDuration,
  watchedEpisodes,
  onSelectEpisode,
  seasonLabel = 'Season 1',
}: WatchPlayEpisodesPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="watch-play-episodes-panel" role="presentation">
      <button
        type="button"
        className="watch-play-episodes-panel__backdrop"
        aria-label="Close episode list"
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
        <header className="watch-play-episodes-panel__header">
          <h2 id={titleId} className="watch-play-episodes-panel__title">
            {seasonLabel}
          </h2>
          <button
            type="button"
            className="watch-play-episodes-panel__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </header>
        <div className="watch-play-episodes-panel__scroll">
          <WatchEpisodeGrid
            className="watch-play-episodes-panel__grid"
            episodes={episodes}
            currentEpisodeId={currentEpisodeId}
            watchedEpisodes={watchedEpisodes}
            posterUrl={posterUrl}
            seriesTitle={seriesTitle}
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
