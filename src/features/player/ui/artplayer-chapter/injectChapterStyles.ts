import { pluginChapterStyle as style } from '../pluginChapterStyle';

export function injectChapterStyles(): void {
  if (typeof document === 'undefined') return;
  const id = 'artplayer-plugin-chapter';
  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = style;
  } else {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = style;
    document.head.appendChild(el);
  }
}
