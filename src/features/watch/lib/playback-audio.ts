/** Ukrainian stays on Hikka. Japanese and English come from Anikoto (sub / dub). */
export type WatchPlaybackAudio = 'uk' | 'ja' | 'en';

export function normalizeWatchPlaybackAudio(
  value: string | null | undefined,
): WatchPlaybackAudio {
  const raw = value?.trim().toLowerCase();
  if (raw === 'ja' || raw === 'en') return raw;
  return 'uk';
}

export function playbackAudioToStreamLang(
  audio: WatchPlaybackAudio,
): 'sub' | 'dub' {
  return audio === 'en' ? 'dub' : 'sub';
}

export type AnikotoMatchStatus = 'idle' | 'loading' | 'ready';

/** Japanese is the startup track. Fall back once the Anikoto match is known. */
export function resolveStartupPlaybackAudio(input: {
  selected: WatchPlaybackAudio;
  matchStatus: AnikotoMatchStatus;
  hasJapanese: boolean;
  hasEnglish: boolean;
  hikkaEligible: boolean;
}): WatchPlaybackAudio {
  const { selected, matchStatus, hasJapanese, hasEnglish, hikkaEligible } = input;
  if (selected !== 'ja' || matchStatus !== 'ready') return selected;
  if (hasJapanese) return 'ja';
  if (!hikkaEligible && hasEnglish) return 'en';
  return 'uk';
}

export function isAnikotoMatchPending(input: {
  audio: WatchPlaybackAudio;
  matchStatus: AnikotoMatchStatus;
}): boolean {
  return input.audio !== 'uk' && input.matchStatus !== 'ready';
}
