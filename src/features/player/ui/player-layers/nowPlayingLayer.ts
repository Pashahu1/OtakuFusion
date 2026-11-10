export const NOW_PLAYING_LAYER_CLASS = 'of-now-playing';

export function formatNowPlayingEpisode(
  episodeNum: number | null | undefined,
  episodeTitle?: string | null,
): string {
  const titled = episodeTitle?.trim() ?? '';
  if (episodeNum == null || !Number.isFinite(episodeNum) || episodeNum <= 0) {
    return titled;
  }
  if (!titled) return `E${episodeNum}`;
  const stripped = titled.replace(
    new RegExp(`^(episode\\s*${episodeNum}|e\\s*${episodeNum})\\s*[—–:\\-]*\\s*`, 'i'),
    '',
  );
  return stripped ? `E${episodeNum}: ${stripped}` : `E${episodeNum}`;
}

export function createNowPlayingLayer() {
  return {
    name: 'nowPlaying',
    html: `
      <div class="${NOW_PLAYING_LAYER_CLASS}">
        <p class="${NOW_PLAYING_LAYER_CLASS}__line">
          <span data-now-playing-title></span>
          <span data-now-playing-ep></span>
        </p>
      </div>
    `,
    style: {
      position: 'absolute',
      zIndex: '121',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>,
  };
}
