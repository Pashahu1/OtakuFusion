export const WATCH_RESOLVE_UPSTREAM_HINTS: Record<string, string> = {
  'no_working_source|sub_not_available':
    'No playable subtitled stream was found for this episode. Try another episode or try again later.',
  'no_working_source|dub_not_available':
    'No playable dubbed stream was found for this episode. Try subtitles or another episode.',
  no_working_source:
    'Could not play this HLS source — it may be blocked or no longer available. Try another episode, provider, or later.',
  'no_working_source|hikka_m3u8_not_found':
    'Could not extract a playable stream from the Ukrainian source page. Try another episode or provider.',
  'no_working_source|hikka_stream_probe_failed':
    'Ukrainian stream is blocked or unavailable. Refresh later.',
  'no_working_source|hikka_source_mismatch':
    'Ukrainian source points at a different season, so it was not started.',
  hikka_catalog_not_found:
    'No Ukrainian dub catalog was found for this title on Hikka Features.',
  hikka_features_forbidden:
    'Hikka Features blocked the server (403). On Vercel set HIKKA_FEATURES_RELAY_BASE; locally add it to .env.local and restart `npm run dev`.',
  'ani_id is required (Hikka slug from catalog)':
    'Ukrainian catalog is still loading or missing. Wait a moment or refresh.',
  anikoto_catalog_not_found:
    'No Japanese or English audio was found for this title.',
  'no_working_source|anikoto_sub_not_available':
    'Japanese audio is not available for this episode. Try Ukrainian or English.',
  'no_working_source|anikoto_dub_not_available':
    'English audio is not available for this episode. Try Ukrainian or Japanese.',
  'keyword is required for Japanese or English audio':
    'The title is still loading. Wait a moment and switch the audio track again.',
  'lang must be sub or dub':
    'Invalid stream language parameter. Refresh the page or toggle Sub/Dub.',
};

export function getWatchResolveErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.';
  const key = err.message.trim();
  return (
    WATCH_RESOLVE_UPSTREAM_HINTS[key] ??
    (key.includes('|')
      ? WATCH_RESOLVE_UPSTREAM_HINTS[key.split('|')[0] ?? ''] ?? key
      : key)
  );
}
