import type Artplayer from 'artplayer';
import { pluginChapterStyle as style } from './pluginChapterStyle';

export interface ChapterItem {
  start: number;
  end: number;
  title: string;
}

export interface ArtplayerPluginChapterOption {
  chapters?: ChapterItem[];
}

type ChapterDomRef = {
  $chapter: HTMLElement;
  $hover: Element;
  $loaded: Element;
  $played: Element;
};

type ArtUtils = {
  setStyle: (el: Element, key: string, value: string | number) => void;
  append: (parent: Element, html: string) => HTMLElement;
  clamp: (n: number, min: number, max: number) => number;
  query: (selector: string, context?: Element) => Element;
  isMobile: boolean;
  addClass: (el: Element, name: string) => void;
  removeClass: (el: Element, name: string) => void;
};

type ArtInstance = Artplayer & {
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

export function artplayerPluginChapter(
  option: ArtplayerPluginChapterOption = {}
): (art: Artplayer) => { name: string; update: (arg: { chapters?: ChapterItem[] }) => void } {
  return (art: Artplayer) => {
    const a = art as ArtInstance;
    const { $player } = a.template;
    const { setStyle, append, clamp, query, isMobile, addClass, removeClass } =
      a.constructor.utils;

    const html = `
                <div class="art-chapter">
                    <div class="art-chapter-inner">
                        <div class="art-progress-hover"></div>
                        <div class="art-progress-loaded"></div>
                        <div class="art-progress-played"></div>
                    </div>
                </div>
        `;

    let titleTimer: ReturnType<typeof setTimeout> | null = null;
    let $chapters: ChapterDomRef[] = [];

    const $progress = a.query('.art-control-progress');
    const $inner = a.query('.art-control-progress-inner');
    const $control = append($inner as HTMLElement, '<div class="art-chapters"></div>');
    const $title = append($inner as HTMLElement, '<div class="art-chapter-title"></div>');

    function showTitle({
      $chapter,
      width,
    }: {
      $chapter: HTMLElement;
      width: number;
    }): void {
      const title = ($chapter.dataset.title ?? '').trim();
      if (title) {
        setStyle($title, 'display', 'flex');
        $title.innerText = title;
        const titleWidth = $title.clientWidth;
        const innerWidth = ($inner as HTMLElement).clientWidth;
        if (width <= titleWidth / 2) {
          setStyle($title, 'left', 0);
        } else if (width > innerWidth - titleWidth / 2) {
          setStyle($title, 'left', `${innerWidth - titleWidth}px`);
        } else {
          setStyle($title, 'left', `${width - titleWidth / 2}px`);
        }
      } else {
        setStyle($title, 'display', 'none');
      }
    }

    function update(chapters: ChapterItem[] = []): void {
      $chapters = [];
      $control.innerText = '';
      removeClass($player, 'artplayer-plugin-chapter');

      if (!Array.isArray(chapters)) return;
      if (!chapters.length) return;
      if (!a.duration) return;

      const sorted = [...chapters].sort((x, y) => x.start - y.start);

      for (let i = 0; i < sorted.length; i++) {
        const chapter = sorted[i];
        const nextChapter = sorted[i + 1];

        if (chapter.end === Infinity) {
          chapter.end = a.duration;
        }
        if (
          typeof chapter.start !== 'number' ||
          typeof chapter.end !== 'number' ||
          typeof chapter.title !== 'string'
        ) {
          throw new Error('Illegal chapter data type');
        }
        if (
          chapter.start < 0 ||
          chapter.end > Math.ceil(a.duration) ||
          chapter.start >= chapter.end
        ) {
          throw new Error('Illegal chapter time point');
        }
        if (nextChapter && chapter.end > nextChapter.start) {
          throw new Error('Illegal chapter time point');
        }
      }

      if (sorted[0].start > 0) {
        sorted.unshift({ start: 0, end: sorted[0].start, title: '' });
      }
      if (sorted[sorted.length - 1].end < a.duration) {
        sorted.push({
          start: sorted[sorted.length - 1].end,
          end: a.duration,
          title: '',
        });
      }

      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].end !== sorted[i + 1].start) {
          sorted.splice(i + 1, 0, {
            start: sorted[i].end,
            end: sorted[i + 1].start,
            title: '',
          });
        }
      }

      $chapters = sorted.map((chapter) => {
        const $chapter = append($control, html);
        const start = clamp(chapter.start, 0, a.duration);
        const end = clamp(chapter.end, 0, a.duration);
        const duration = end - start;
        const percentage = duration / a.duration;
        $chapter.dataset.start = String(start);
        $chapter.dataset.end = String(end);
        $chapter.dataset.duration = String(duration);
        $chapter.dataset.title = chapter.title.trim();
        $chapter.style.width = `${percentage * 100}%`;

        return {
          $chapter,
          $hover: query('.art-progress-hover', $chapter),
          $loaded: query('.art-progress-loaded', $chapter),
          $played: query('.art-progress-played', $chapter),
        };
      });

      addClass($player, 'artplayer-plugin-chapter');
      a.emit('setBar', 'loaded', a.loaded ?? 0);
    }

    a.on('setBar', (type: unknown, percentage: unknown, event: unknown) => {
      const typeStr = String(type);
      const pct = Number(percentage);
      if (!$chapters.length) return;

      for (let i = 0; i < $chapters.length; i++) {
        const { $chapter, $loaded, $played, $hover } = $chapters[i];

        const $target = (
          { hover: $hover, loaded: $loaded, played: $played } as Record<string, Element>
        )[typeStr];

        if (!$target) return;

        const width = ($control as HTMLElement).clientWidth * pct;
        const currentTime = a.duration * pct;
        const duration = parseFloat($chapter.dataset.duration ?? '0');
        const start = parseFloat($chapter.dataset.start ?? '0');
        const end = parseFloat($chapter.dataset.end ?? '0');

        if (currentTime < start) {
          setStyle($target, 'width', 0);
        }
        if (currentTime > end) {
          setStyle($target, 'width', '100%');
        }
        if (currentTime >= start && currentTime <= end) {
          const segmentPct = (currentTime - start) / duration;
          setStyle($target, 'width', `${segmentPct * 100}%`);

          if (isMobile) {
            if (typeStr === 'played' && event) {
              showTitle({ $chapter, width });
              if (titleTimer) clearTimeout(titleTimer);
              titleTimer = setTimeout(() => {
                setStyle($title, 'display', 'none');
              }, 500);
            }
          } else {
            if (typeStr === 'hover') {
              showTitle({ $chapter, width });
            }
          }
        }
      }
    });

    if (!isMobile) {
      a.proxy($progress, 'mouseleave', () => {
        if (!$chapters.length) return;
        setStyle($title, 'display', 'none');
      });
    }

    a.once('video:loadedmetadata', () => update(option.chapters));

    return {
      name: 'artplayerPluginChapter',
      update: ({ chapters }: { chapters?: ChapterItem[] }) => update(chapters ?? []),
    };
  };
}

/** Inject plugin styles into document (runs once when module loads in browser). */
function injectChapterStyles(): void {
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
