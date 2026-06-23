import type Artplayer from 'artplayer';

export type ArtplayerNearEndState = Artplayer & {
  /** Set by episode lifecycle: whether the current episode has a successor. */
  $ofHasNextEpisode?: boolean;
};

export function setArtplayerHasNextEpisode(art: Artplayer, hasNextEpisode: boolean): void {
  (art as ArtplayerNearEndState).$ofHasNextEpisode = hasNextEpisode;
}

export function readArtplayerHasNextEpisode(art: Artplayer): boolean {
  return (art as ArtplayerNearEndState).$ofHasNextEpisode === true;
}
