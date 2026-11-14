import { anikotoDubPlaylistIsDistinct } from './mapAnikotoStream';
import type { AnikotoMappedStream } from './anikotoTypes';

export interface AnikotoServerAttempt {
  server: string;
  sub: AnikotoMappedStream | null;
  dub: AnikotoMappedStream | null;
}

export interface AnikotoPlaybackPick {
  server: string;
  mapped: AnikotoMappedStream;
}

export function pickAnikotoPlaybackAttempt(
  attempts: AnikotoServerAttempt[],
  type: 'sub' | 'dub',
): AnikotoPlaybackPick | null {
  for (const attempt of attempts) {
    if (type === 'sub') {
      if (attempt.sub) return { server: attempt.server, mapped: attempt.sub };
      continue;
    }
    if (!attempt.dub) continue;
    if (!anikotoDubPlaylistIsDistinct(attempt.sub?.url ?? null, attempt.dub.url)) continue;
    return { server: attempt.server, mapped: attempt.dub };
  }
  return null;
}

/** `null` means the playlists could not be compared, so the catalog dub flag stays. */
export function resolveAnikotoEnglishAvailability(
  catalogHasEnglish: boolean,
  playlistsAreDistinct: boolean | null,
): boolean {
  if (!catalogHasEnglish) return false;
  if (playlistsAreDistinct === false) return false;
  return true;
}
