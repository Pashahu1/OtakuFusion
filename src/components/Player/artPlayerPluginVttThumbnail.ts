import type Artplayer from 'artplayer';
import { getVttArray, type VttThumbItem } from './getVttArray';

export interface VttThumbnailOption {
  vtt: string;
  style?: Record<string, string>;
}

export function artplayerPluginVttThumbnail(
  option: VttThumbnailOption
): (art: Artplayer) => { name: string } {
  return (art: Artplayer) => {
    type ArtInstance = Artplayer & {
      constructor: {
        utils: {
          setStyle: (el: HTMLElement, k: string, v: string | number) => void;
          isMobile: boolean;
          addClass: (el: HTMLElement, name: string) => void;
        };
      };
      template: { $progress: HTMLElement };
    };
    const {
      constructor: {
        utils: { setStyle, isMobile, addClass },
      },
      template: { $progress },
    } = art as ArtInstance;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let thumbnails: VttThumbItem[] = [];

    function showThumbnails(
      $control: HTMLElement,
      find: VttThumbItem,
      width: number
    ): void {
      setStyle($control, 'backgroundImage', `url(${find.url})`);
      setStyle($control, 'height', `${find.h ?? 0}px`);
      setStyle($control, 'width', `${find.w ?? 0}px`);
      setStyle(
        $control,
        'backgroundPosition',
        `-${find.x ?? 0}px -${find.y ?? 0}px`
      );
      const findW = Number(find.w) || 0;
      if (width <= findW / 2) {
        setStyle($control, 'left', 0);
      } else if (width > $progress.clientWidth - findW / 2) {
        setStyle($control, 'left', `${$progress.clientWidth - findW}px`);
      } else {
        setStyle($control, 'left', `${width - findW / 2}px`);
      }
    }

    art.controls.add({
      name: 'vtt-thumbnail',
      position: 'top',
      index: 20,
      style: option.style ?? {},
      mounted($control: HTMLElement) {
        addClass($control, 'art-control-thumbnails');
        setStyle($control, 'display', 'none');

        art.on('setBar', (type: string, percentage: number, event: unknown) => {
          const isMobileDroging = type === 'played' && event && isMobile;

          if (type === 'hover' || isMobileDroging) {
            const width = $progress.clientWidth * percentage;
            const second = percentage * art.duration;
            setStyle($control, 'display', 'flex');

            const find = thumbnails.find(
              (item) => second >= item.start && second <= item.end
            );
            if (!find) {
              setStyle($control, 'display', 'none');
              return;
            }

            if (width > 0 && width < $progress.clientWidth) {
              showThumbnails($control, find, width);
            } else {
              if (!isMobile) {
                setStyle($control, 'display', 'none');
              }
            }

            if (isMobileDroging) {
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => {
                setStyle($control, 'display', 'none');
              }, 500);
            }
          }
        });
      },
    });

    getVttArray(option.vtt).then((arr) => {
      thumbnails = arr ?? [];
    });

    return {
      name: 'artplayerPluginVttThumbnail',
    };
  };
}
