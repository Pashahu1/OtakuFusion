import type Artplayer from 'artplayer';

import type {
  ArtInstance,
  ArtplayerPluginChapterOption,
  ChapterDomRef,
  ChapterItem,
} from './types';
import { normalizeChaptersForDuration } from './normalizeChapters';

const CHAPTER_SEGMENT_HTML = `
                <div class="art-chapter">
                    <div class="art-chapter-inner">
                        <div class="art-progress-hover"></div>
                        <div class="art-progress-loaded"></div>
                        <div class="art-progress-played"></div>
                    </div>
                </div>
        `;

export function createChapterPlugin(
  option: ArtplayerPluginChapterOption = {},
): (art: Artplayer) => {
  name: string;
  update: (arg: { chapters?: ChapterItem[] }) => void;
} {
  return (art: Artplayer) => {
    const a = art as ArtInstance;
    const { $player } = a.template;
    const { setStyle, append, clamp, query, isMobile, addClass, removeClass } =
      a.constructor.utils;

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

      try {
        const sorted = normalizeChaptersForDuration(chapters, a.duration);

        $chapters = sorted.map((chapter) => {
          const $chapter = append($control, CHAPTER_SEGMENT_HTML);
          const start = clamp(chapter.start, 0, a.duration);
          const end = clamp(chapter.end, 0, a.duration);
          const segmentDuration = end - start;
          const percentage = segmentDuration / a.duration;
          $chapter.dataset.start = String(start);
          $chapter.dataset.end = String(end);
          $chapter.dataset.duration = String(segmentDuration);
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
      } catch (e) {
        if (
          typeof process !== 'undefined' &&
          process.env.NODE_ENV === 'development'
        ) {
          console.warn('[artplayerPluginChapter] invalid chapters, skipped:', e);
        }
      }
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
          } else if (typeStr === 'hover') {
            showTitle({ $chapter, width });
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
