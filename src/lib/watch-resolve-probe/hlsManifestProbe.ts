export function hlsMasterSuggestsDubLikeAudio(masterText: string): boolean {
  if (!masterText.includes('#EXTM3U')) return false;
  const audioLines = masterText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes('#EXT-X-MEDIA:TYPE=AUDIO'));
  if (audioLines.length === 0) return true;
  if (audioLines.length >= 2) return true;

  const line = audioLines[0].toLowerCase();
  if (
    line.includes('language="en"') ||
    line.includes("language='en'") ||
    line.includes('language=en,')
  ) {
    return true;
  }
  if (
    line.includes('english') ||
    line.includes(' eng,') ||
    line.includes(',eng,') ||
    line.includes(' eng ') ||
    /\beng dub\b/.test(line) ||
    line.includes('simuldub') ||
    line.includes('funimation') ||
    /\bdub\b/.test(line)
  ) {
    return true;
  }
  return false;
}

export function isMirunoDubHlsManifestCheckEnabled(): boolean {
  const v = process.env.MIRUNO_DUB_HLS_MANIFEST_CHECK?.trim().toLowerCase();
  return v === '1' || v === 'true';
}
