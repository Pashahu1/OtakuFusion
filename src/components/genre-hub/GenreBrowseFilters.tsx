'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { GenreMediaFilter } from '@/shared/data/genre-hub';
import './GenreBrowseFilters.scss';

const MEDIA_OPTIONS: { id: GenreMediaFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tv', label: 'Series' },
  { id: 'movie', label: 'Movies' },
];

interface GenreBrowseFiltersProps {
  genre: string;
  sectionId: string;
  sectionLabel: string;
  media: GenreMediaFilter;
}

export function GenreBrowseFilters({
  genre,
  sectionId,
  sectionLabel,
  media,
}: GenreBrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function setMedia(next: GenreMediaFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('media');
    else params.set('media', next);
    params.delete('page');
    router.push(
      `/anime/category/${encodeURIComponent(genre)}/browse/${sectionId}?${params.toString()}`,
      { scroll: false }
    );
    setIsOpen(false);
  }

  return (
    <div className="genre-browse-toolbar genre-browse-layout__toolbar">
      <div className="genre-browse-toolbar__heading">
        <p className="genre-browse-toolbar__breadcrumb">
          <span>{genre}</span>
          <span aria-hidden>/</span>
          <span>{sectionLabel}</span>
        </p>
      </div>

      <div
        ref={rootRef}
        className={`genre-browse-filter ${isOpen ? 'genre-browse-filter--open' : ''}`}
      >
        <button
          type="button"
          className="genre-browse-filter__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filter
        </button>

        {isOpen ? (
          <div
            id={panelId}
            className="genre-browse-filter__panel"
            role="dialog"
            aria-label="Browse filters"
          >
            <fieldset className="genre-browse-filter__group">
              <legend className="genre-browse-filter__legend">Language</legend>
              <label className="genre-browse-filter__option genre-browse-filter__option--active">
                <input type="radio" name="language" defaultChecked disabled />
                <span>All</span>
              </label>
              <p className="genre-browse-filter__hint">
                Sub / dub filters need catalog data — coming later.
              </p>
            </fieldset>

            <fieldset className="genre-browse-filter__group">
              <legend className="genre-browse-filter__legend">Media</legend>
              {MEDIA_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`genre-browse-filter__option ${
                    media === opt.id ? 'genre-browse-filter__option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="media"
                    checked={media === opt.id}
                    onChange={() => setMedia(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        ) : null}
      </div>
    </div>
  );
}
