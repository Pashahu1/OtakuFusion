import type Artplayer from 'artplayer';

export type ArtplayerNearEndState = Artplayer & {
  /** Set by episode lifecycle: whether the current episode has a successor. */
  $ofHasNextEpisode?: boolean;
  $ofPlayNext?: () => void;
};

export function setArtplayerPlayNextHandler(
  art: Artplayer,
  playNext: (() => void) | undefined,
): void {
  (art as ArtplayerNearEndState).$ofPlayNext = playNext;
}

export function runArtplayerPlayNext(art: Artplayer): void {
  (art as ArtplayerNearEndState).$ofPlayNext?.();
}

export function getArtplayerNextEpisodeControl(art: Artplayer): HTMLElement | null {
  return art.template?.$player?.querySelector<HTMLElement>('.art-control-nextEpisode') ?? null;
}

export function setArtplayerHasNextEpisode(art: Artplayer, hasNextEpisode: boolean): void {
  (art as ArtplayerNearEndState).$ofHasNextEpisode = hasNextEpisode;
  const control = getArtplayerNextEpisodeControl(art);
  if (!control) return;
  control.classList.toggle('is-hidden', !hasNextEpisode);
  control.setAttribute('aria-hidden', hasNextEpisode ? 'false' : 'true');
}

export function readArtplayerHasNextEpisode(art: Artplayer): boolean {
  return (art as ArtplayerNearEndState).$ofHasNextEpisode === true;
}
