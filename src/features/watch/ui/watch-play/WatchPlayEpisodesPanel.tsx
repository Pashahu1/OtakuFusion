'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import { WatchEpisodeCard } from '@/features/watch/ui/watch-series/WatchEpisodeCard';
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

  const handleSelect = useCallback(
    (item: EpisodesTypes) => {
      const id = getEpisodeNumberFromId(item.id) ?? String(item.episode_no);
      onSelectEpisode(id);
      onClose();
    },
    [onClose, onSelectEpisode]
  );

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
          <div className="watch-play-episodes-panel__grid">
            {episodes.map((item) => {
              const epKey = getEpisodeNumberFromId(item.id) ?? String(item.episode_no);
              const isActive = episodeMatchesSelection(item, currentEpisodeId);
              const isWatched = Boolean(watchedEpisodes[epKey]);
              return (
                <WatchEpisodeCard
                  key={`${item.id}-${item.episode_no}`}
                  item={item}
                  posterUrl={posterUrl}
                  seriesTitle={seriesTitle}
                  episodeDuration={episodeDuration}
                  isActive={isActive}
                  isWatched={isWatched}
                  nowPlaying={isActive}
                  onSelect={() => handleSelect(item)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
