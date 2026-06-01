import type Artplayer from 'artplayer';

export interface ChapterItem {
  start: number;
  end: number;
  title: string;
}

export interface ArtplayerPluginChapterOption {
  chapters?: ChapterItem[];
}

export type ChapterDomRef = {
  $chapter: HTMLElement;
  $hover: Element;
  $loaded: Element;
  $played: Element;
};

export type ArtUtils = {
  setStyle: (el: Element, key: string, value: string | number) => void;
  append: (parent: Element, html: string) => HTMLElement;
  clamp: (n: number, min: number, max: number) => number;
  query: (selector: string, context?: Element) => Element;
  isMobile: boolean;
  addClass: (el: Element, name: string) => void;
  removeClass: (el: Element, name: string) => void;
};

export type ArtInstance = Artplayer & {
  template: { $player: HTMLElement };
  constructor: { utils: ArtUtils };
  query: (selector: string) => Element;
  duration: number;
  loaded?: number;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  once: (event: string, cb: () => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  proxy: (el: Element, event: string, cb: () => void) => void;
};
