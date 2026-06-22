'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  PLAYBACK_PREVIEW_UPDATED_EVENT,
  episodePreviewKey,
  readEpisodePreviewBlob,
} from '@/features/watch/lib/playback-preview-store';

interface LoadedPreview {
  key: string;
  url: string;
}

export function useEpisodePreviewObjectUrl(
  animeId: string | undefined,
  episodeId: string | undefined,
): string | null {
  const trimmedAnimeId = animeId?.trim() ?? '';
  const trimmedEpisodeId = episodeId?.trim() ?? '';
  const previewKey =
    trimmedAnimeId && trimmedEpisodeId
      ? episodePreviewKey(trimmedAnimeId, trimmedEpisodeId)
      : null;

  const [loadedPreview, setLoadedPreview] = useState<LoadedPreview | null>(null);

  const objectUrl =
    previewKey && loadedPreview?.key === previewKey ? loadedPreview.url : null;

  useEffect(() => {
    if (!previewKey) return;

    let cancelled = false;
    let activeUrl: string | null = null;

    const load = async () => {
      const blob = await readEpisodePreviewBlob(previewKey);
      if (cancelled) return;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
        activeUrl = null;
      }
      if (!blob) {
        setLoadedPreview(null);
        return;
      }
      activeUrl = URL.createObjectURL(blob);
      setLoadedPreview({ key: previewKey, url: activeUrl });
    };

    void load();

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ animeId?: string; episodeId?: string }>).detail;
      if (detail?.animeId !== trimmedAnimeId || detail?.episodeId !== trimmedEpisodeId) return;
      void load();
    };

    window.addEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [previewKey, trimmedAnimeId, trimmedEpisodeId]);

  return objectUrl;
}

export function useEpisodePreviewMap(
  animeId: string | undefined,
  episodeIds: string[],
): Record<string, string> {
  const trimmedAnimeId = animeId?.trim() ?? '';
  const episodeIdsKey = useMemo(() => episodeIds.join('|'), [episodeIds]);
  const mapKey =
    trimmedAnimeId && episodeIds.length > 0
      ? `${trimmedAnimeId}|${episodeIdsKey}`
      : null;

  const [loadedMapKey, setLoadedMapKey] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, string>>({});

  const publicMap = mapKey && loadedMapKey === mapKey ? map : {};

  useEffect(() => {
    if (!mapKey) return;

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
        const blob = await readEpisodePreviewBlob(episodePreviewKey(trimmedAnimeId, episodeId));
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        activeUrls.push(url);
        next[episodeId] = url;
      }
      if (!cancelled) {
        setMap(next);
        setLoadedMapKey(mapKey);
      }
    };

    void load();

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ animeId?: string; episodeId?: string }>).detail;
      if (detail?.animeId !== trimmedAnimeId) return;
      void load();
    };

    window.addEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PLAYBACK_PREVIEW_UPDATED_EVENT, onUpdated);
      revokeActiveUrls();
    };
  }, [mapKey, trimmedAnimeId, episodeIds, episodeIdsKey]);

  return publicMap;
}
