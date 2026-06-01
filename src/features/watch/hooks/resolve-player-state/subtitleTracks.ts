import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';

export function parseSubtitleTracks(
  tracks: Array<{ file: string; kind?: string; label?: string; default?: boolean }>,
): SubtitleItem[] {
  return tracks
    .filter((t) => {
      if (!t.file?.trim()) return false;
      const kind = t.kind?.trim().toLowerCase();
      if (!kind) return true;
      if (kind === 'thumbnails' || kind === 'thumbnail' || kind === 'thumbs') return false;
      return true;
    })
    .map((t) => ({
      file: t.file,
      label: t.label?.trim() || 'Subtitle',
      ...(typeof t.default === 'boolean' ? { default: t.default } : {}),
    }));
}

function isEnglishSubtitleLabel(label: string): boolean {
  const n = label.trim().toLowerCase();
  return n.includes('english') || n === 'eng' || n.startsWith('en ');
}

function isEnglishAiSubtitleLabel(label: string): boolean {
  const n = label.trim().toLowerCase();
  if (!isEnglishSubtitleLabel(label)) return false;
  return n.includes('ai') || n.includes('(ai)') || n.includes('[ai]');
}

export function filterSubtitleTracksByStreamLang(
  tracks: SubtitleItem[],
  streamLang: 'sub' | 'dub',
): SubtitleItem[] {
  if (!tracks.length) return tracks;
  if (streamLang === 'dub') {
    const englishAi = tracks.filter((t) => isEnglishAiSubtitleLabel(t.label));
    if (englishAi.length) return englishAi;
    const english = tracks.filter((t) => isEnglishSubtitleLabel(t.label));
    return english.length ? english : tracks;
  }
  const nonEnglishAi = tracks.filter((t) => !isEnglishAiSubtitleLabel(t.label));
  return nonEnglishAi.length ? nonEnglishAi : tracks;
}

export function getThumbnailTrack(tracks: VideoTrack[]): string | null {
  const thumbnail = tracks.find(
    (t) =>
      (t.kind === 'thumbnails' || t.kind === 'thumbnail' || t.kind === 'thumbs') &&
      t.file?.trim(),
  );
  return thumbnail?.file ?? null;
}
