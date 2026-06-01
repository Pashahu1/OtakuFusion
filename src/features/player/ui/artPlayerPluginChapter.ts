import { createChapterPlugin } from './artplayer-chapter/createChapterPlugin';
import { injectChapterStyles } from './artplayer-chapter/injectChapterStyles';

export type { ChapterItem, ArtplayerPluginChapterOption } from './artplayer-chapter/types';

export const artplayerPluginChapter = createChapterPlugin;

injectChapterStyles();

declare global {
  interface Window {
    artplayerPluginChapter?: typeof artplayerPluginChapter;
  }
}

if (typeof window !== 'undefined') {
  window.artplayerPluginChapter = artplayerPluginChapter;
}

export default artplayerPluginChapter;
