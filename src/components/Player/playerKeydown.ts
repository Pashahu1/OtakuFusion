import type Artplayer from 'artplayer';
import { KEY_CODES } from './playerConstants';

type KeyHandler = (event: KeyboardEvent, art: Artplayer) => void;

function withPreventDefault(handler: KeyHandler): KeyHandler {
  return (event, art) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event, art);
  };
}

const KEY_HANDLERS: Record<string, KeyHandler> = {
  [KEY_CODES.M]: (_, art) => {
    art.muted = !art.muted;
  },
  [KEY_CODES.I]: (_, art) => {
    art.pip = !art.pip;
  },
  [KEY_CODES.F]: withPreventDefault((_, art) => {
    art.fullscreen = !art.fullscreen;
  }),
  [KEY_CODES.V]: withPreventDefault((_, art) => {
    art.subtitle.show = !art.subtitle.show;
  }),
  [KEY_CODES.SPACE]: withPreventDefault((_, art) => {
    art.playing ? art.pause() : art.play();
  }),
  [KEY_CODES.ARROW_UP]: withPreventDefault((_, art) => {
    art.volume = Math.min(art.volume + 0.1, 1);
  }),
  [KEY_CODES.ARROW_DOWN]: withPreventDefault((_, art) => {
    art.volume = Math.max(art.volume - 0.1, 0);
  }),
  [KEY_CODES.ARROW_RIGHT]: withPreventDefault((_, art) => {
    art.currentTime = Math.min(art.currentTime + 10, art.duration);
  }),
  [KEY_CODES.ARROW_LEFT]: withPreventDefault((_, art) => {
    art.currentTime = Math.max(art.currentTime - 10, 0);
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
