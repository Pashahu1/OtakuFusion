'use client';

import { useEffect, useState } from 'react';

import {
  PLAYBACK_PREVIEW_UPDATED_EVENT,
  episodePreviewKey,
  readEpisodePreviewBlob,
} from '@/features/watch/lib/playback-preview-store';

export function useEpisodePreviewObjectUrl(
  animeId: string | undefined,
  episodeId: string | undefined,
): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!animeId?.trim() || !episodeId?.trim()) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let activeUrl: string | null = null;
    const key = episodePreviewKey(animeId, episodeId);

    const load = async () => {
      const blob = await readEpisodePreviewBlob(key);
      if (cancelled) return;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
        activeUrl = null;
      }
      if (!blob) {
        setObjectUrl(null);
        return;
      }
      activeUrl = URL.createObjectURL(blob);
      setObjectUrl(activeUrl);
    };

    void load();

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ animeId?: string; episodeId?: string }>).detail;
      if (detail?.animeId !== animeId || detail?.episodeId !== episodeId) return;
      void load();
    };

    window.addEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [animeId, episodeId]);

  return objectUrl;
}

export function useEpisodePreviewMap(
  animeId: string | undefined,
  episodeIds: string[],
): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!animeId?.trim() || episodeIds.length === 0) {
      setMap({});
      return;
    }

    let cancelled = false;
    const activeUrls: string[] = [];

    const revokeActiveUrls = () => {
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      activeUrls.length = 0;
    };

    const load = async () => {
      revokeActiveUrls();
      const next: Record<string, string> = {};
      for (const episodeId of episodeIds) {
        if (cancelled) break;
        const blob = await readEpisodePreviewBlob(episodePreviewKey(animeId, episodeId));
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        activeUrls.push(url);
        next[episodeId] = url;
      }
      if (!cancelled) setMap(next);
    };

    void load();

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ animeId?: string; episodeId?: string }>).detail;
      if (detail?.animeId !== animeId) return;
      void load();
    };

    window.addEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
      revokeActiveUrls();
    };
  }, [animeId, episodeIds.join('|')]);

  return map;
}
