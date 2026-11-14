import type { AnikotoMappedStream } from './anikotoTypes';

function readSpan(value: unknown): { start: number; end: number } | null {
  if (!value || typeof value !== 'object') return null;
  const start = (value as { start?: unknown }).start;
  const end = (value as { end?: unknown }).end;
  if (typeof start !== 'number' || typeof end !== 'number') return null;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
}

function readTracks(value: unknown): AnikotoMappedStream['tracks'] {
  if (!Array.isArray(value)) return [];
  const tracks: AnikotoMappedStream['tracks'] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const file = (row as { file?: unknown }).file;
    if (typeof file !== 'string' || !/^https?:\/\//i.test(file.trim())) continue;
    const labelRaw = (row as { label?: unknown }).label;
    const kindRaw = (row as { kind?: unknown }).kind;
    const label = typeof labelRaw === 'string' && labelRaw.trim() ? labelRaw.trim() : 'Subtitle';
    const kind = typeof kindRaw === 'string' && kindRaw.trim() ? kindRaw.trim() : 'captions';
    const isDefault = (row as { default?: unknown }).default === true;
    tracks.push({
      file: file.trim(),
      label,
      kind,
      ...(isDefault ? { default: true } : {}),
    });
  }
  return tracks;
}

export function anikotoDubPlaylistIsDistinct(
  subUrl: string | null,
  dubUrl: string | null,
): boolean {
  const dub = dubUrl?.trim() ?? '';
  if (!dub) return false;
  const sub = subUrl?.trim() ?? '';
  if (!sub) return true;
  return sub !== dub;
}

export function mapAnikotoStreamPayload(payload: unknown): AnikotoMappedStream | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as { data?: unknown }).data ?? payload;
  if (!data || typeof data !== 'object') return null;
  const urlRaw = (data as { m3u8?: unknown }).m3u8 ?? (data as { url?: unknown }).url;
  if (typeof urlRaw !== 'string' || !/^https?:\/\//i.test(urlRaw.trim())) return null;
  const refererRaw = (data as { referer?: unknown }).referer;
  const referer =
    typeof refererRaw === 'string' && /^https?:\/\//i.test(refererRaw.trim())
      ? refererRaw.trim()
      : 'https://megaplay.buzz/';
  return {
    url: urlRaw.trim(),
    referer,
    tracks: readTracks((data as { subtitles?: unknown }).subtitles),
    intro: readSpan((data as { intro?: unknown }).intro),
    outro: readSpan((data as { outro?: unknown }).outro),
  };
}
