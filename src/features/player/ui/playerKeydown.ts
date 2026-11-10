import type Artplayer from 'artplayer';
import { KEY_CODES, PLAYER_SKIP_SECONDS } from './playerConstants';
import { skipPlaybackBy } from './player-skip/skipPlaybackBy';

type KeyHandler = (event: KeyboardEvent, art: Artplayer) => void;

function withPreventDefault(handler: KeyHandler): KeyHandler {
  return (event, art) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event, art);
  };
}

function togglePlayback(_event: KeyboardEvent, art: Artplayer): void {
  if (art.playing) art.pause();
  else void art.play();
}

const KEY_HANDLERS: Record<string, KeyHandler> = {
  [KEY_CODES.M]: (_, art) => {
    art.muted = !art.muted;
  },
  [KEY_CODES.F]: withPreventDefault((_, art) => {
    art.fullscreen = !art.fullscreen;
  }),
  [KEY_CODES.V]: withPreventDefault((_, art) => {
    art.subtitle.show = !art.subtitle.show;
  }),
  [KEY_CODES.SPACE]: withPreventDefault(togglePlayback),
  [KEY_CODES.ENTER]: withPreventDefault(togglePlayback),
  [KEY_CODES.MEDIA_PLAY_PAUSE]: withPreventDefault(togglePlayback),
  [KEY_CODES.J]: withPreventDefault((_, art) => {
    skipPlaybackBy(art, -PLAYER_SKIP_SECONDS);
  }),
  [KEY_CODES.L]: withPreventDefault((_, art) => {
    skipPlaybackBy(art, PLAYER_SKIP_SECONDS);
  }),
  [KEY_CODES.ARROW_UP]: withPreventDefault((_, art) => {
    art.volume = Math.min(art.volume + 0.1, 1);
  }),
  [KEY_CODES.ARROW_DOWN]: withPreventDefault((_, art) => {
    art.volume = Math.max(art.volume - 0.1, 0);
  }),
  [KEY_CODES.ARROW_RIGHT]: withPreventDefault((_, art) => {
    skipPlaybackBy(art, PLAYER_SKIP_SECONDS);
  }),
  [KEY_CODES.ARROW_LEFT]: withPreventDefault((_, art) => {
    skipPlaybackBy(art, -PLAYER_SKIP_SECONDS);
  }),
  [KEY_CODES.ESCAPE]: withPreventDefault((_, art) => {
    if (art.fullscreen) art.fullscreen = false;
  }),
};


export function handlePlayerKeydown(
  event: KeyboardEvent,
  art: Artplayer
): void {
  const tagName = (event.target as HTMLElement)?.tagName?.toLowerCase() ?? '';
  if (tagName === 'input' || tagName === 'textarea') return;

  const key = event.key.toLowerCase();
  const handler = KEY_HANDLERS[key];
  if (handler) handler(event, art);
}
