import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import { playbackAudioFromMenuMode } from '@/features/player/ui/language-menu/buildFlatLanguageMenu';
import type { WatchStreamProvider } from '@/lib/watch-provider';

export interface ApplyLanguageTrackDeps {
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
  setPlaybackAudio?: (next: WatchPlaybackAudio) => void;
}

export function applyLanguageTrack(
  item: Record<string, unknown>,
  deps: ApplyLanguageTrackDeps,
): void {
  const { setWatchStreamProvider, setActiveServerId, setPlaybackAudio } = deps;
  const mode = typeof item.__mode === 'string' ? item.__mode : undefined;
  const playbackAudio = playbackAudioFromMenuMode(
    mode === 'hikka' || mode === 'anikoto-ja' || mode === 'anikoto-en' ? mode : undefined,
  );

  if (playbackAudio) {
    setPlaybackAudio?.(playbackAudio);
    if (playbackAudio === 'uk') setWatchStreamProvider('hikka');
    persistServerPref(playbackAudio === 'en' ? 'dub' : 'sub', null);
    return;
  }

  const dataId = item.data_id != null ? String(item.data_id) : null;
  if (dataId) setActiveServerId(dataId);
  persistServerPref(
    typeof item.type === 'string' ? item.type : null,
    typeof item.serverName === 'string' ? item.serverName : null,
  );
}

function persistServerPref(type: string | null, serverName: string | null): void {
  try {
    if (type) localStorage.setItem('server_type', type);
    if (serverName) localStorage.setItem('server_name', serverName);
    else if (serverName === null) localStorage.removeItem('server_name');
  } catch {
    /* ignore */
  }
}
