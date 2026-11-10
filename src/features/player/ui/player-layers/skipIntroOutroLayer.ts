import { tStatic } from '@/i18n/t';

export const SKIP_HOVER_CLASS = 'of-skip-hover';

function skipIntroOutroHtml(): string {
  return `
  <div class="of-skip-segment">
    <button type="button" class="of-skip-segment__btn" data-skip-segment>
      <span class="of-skip-segment__label">${tStatic('player.skipIntro')}</span>
      <svg class="of-skip-segment__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M4.8 6.4v11.2L13.6 12 4.8 6.4zm10.4 0v11.2h2.2V6.4h-2.2z"/>
      </svg>
    </button>
  </div>
`;
}

export function createSkipIntroOutroLayer() {
  return {
    name: 'skipIntroOutro',
    html: skipIntroOutroHtml(),
    style: {
      display: 'none',
      position: 'absolute',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>,
  };
}
