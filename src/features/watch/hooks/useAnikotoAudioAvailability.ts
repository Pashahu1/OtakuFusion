'use client';

import { useEffect, useState } from 'react';

import type { AnimeData } from '@/shared/types/animeDetailsTypes';

export interface AnikotoAudioAvailability {
  status: 'idle' | 'loading' | 'ready';
  japanese: boolean;
  english: boolean;
}

const IDLE_AVAILABILITY: AnikotoAudioAvailability = {
  status: 'idle',
  japanese: false,
  english: false,
};

const UNAVAILABLE: AnikotoAudioAvailability = {
  status: 'ready',
  japanese: false,
  english: false,
};

function readEpisodeCount(raw: string | undefined): number | null {
  if (!raw) return null;
  const count = Number(raw);
  if (!Number.isFinite(count) || count <= 0) return null;
  return Math.floor(count);
}

export function useAnikotoAudioAvailability(
  anime: AnimeData | null,
): AnikotoAudioAvailability {
  const [availability, setAvailability] = useState<AnikotoAudioAvailability>(IDLE_AVAILABILITY);

  const title = anime?.title?.trim() ?? '';
  const romaji = anime?.romaji_title?.trim() ?? '';
  const japanese = anime?.japanese_title?.trim() ?? '';
  const synonyms = anime?.animeInfo?.Synonyms?.trim() ?? '';
  const format = anime?.showType?.trim() ?? '';
  const episodeCount = readEpisodeCount(anime?.animeInfo?.tvInfo?.episodeTotal);

  useEffect(() => {
    if (!title) {
      setAvailability(IDLE_AVAILABILITY);
      return;
    }

    const controller = new AbortController();
    setAvailability((current) => ({ ...current, status: 'loading' }));
    const query = new URLSearchParams({ title });
    if (romaji) query.set('romaji_title', romaji);
    if (japanese) query.set('japanese_title', japanese);
    if (synonyms) query.set('synonyms', synonyms);
    if (format) query.set('format', format);
    if (episodeCount) query.set('episodes', String(episodeCount));

    void (async () => {
      try {
        const response = await fetch(`/api/anikoto/match?${query.toString()}`, {
          signal: controller.signal,
          headers: { accept: 'application/json' },
        });
        if (response.status === 404) {
          setAvailability(UNAVAILABLE);
          return;
        }
        if (!response.ok) {
          setAvailability(UNAVAILABLE);
          return;
        }
        const payload = (await response.json()) as {
          success?: boolean;
          hasJapanese?: boolean;
          hasEnglish?: boolean;
        };
        if (!payload.success) {
          setAvailability(UNAVAILABLE);
          return;
        }
        setAvailability({
          status: 'ready',
          japanese: payload.hasJapanese === true,
          english: payload.hasEnglish === true,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (!controller.signal.aborted) setAvailability(UNAVAILABLE);
      }
    })();

    return () => controller.abort();
  }, [title, romaji, japanese, synonyms, format, episodeCount]);

  return availability;
}
