import type { Dispatch, SetStateAction } from 'react';

export function onEpisodeWatched(
  id: string,
  setWatchedEpisodes: Dispatch<SetStateAction<Record<string, boolean>>>
): void {
  const epId = id != null ? String(id) : '';
  if (!epId) return;
  try {
    setWatchedEpisodes((prev) => ({
      ...(typeof prev === 'object' && prev && !Array.isArray(prev) ? prev : {}),
      [epId]: true,
    }));
  } catch (e) {
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn('Failed to save watched episode:', e);
    }
  }
}
