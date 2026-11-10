import { tStatic } from '@/i18n/t';

export const UP_NEXT_LAYER = 'upNext';

export function createUpNextLayer() {
  return {
    name: UP_NEXT_LAYER,
    html: `
      <button type="button" class="of-up-next" data-up-next-play>
        <span class="of-up-next__thumb">
          <img class="of-up-next__image" data-up-next-image alt="" hidden />
          <span class="of-up-next__play" aria-hidden="true">
            <span class="of-up-next__play-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M8 5.14v13.72L19 12 8 5.14z"/>
              </svg>
            </span>
          </span>
        </span>
        <span class="of-up-next__body">
          <span class="of-up-next__heading">${tStatic('player.nextEpisode')}</span>
          <span class="of-up-next__title" data-up-next-title>${tStatic('player.nextEpisodeFallback')}</span>
          <span class="of-up-next__subtitle" data-up-next-subtitle hidden></span>
        </span>
      </button>
    `,
    style: {
      display: 'none',
      position: 'absolute',
      inset: '0',
      zIndex: '10050',
      pointerEvents: 'none',
    },
  };
}
