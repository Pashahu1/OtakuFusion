import { tStatic } from '@/i18n/t';

export const TRACKS_PANEL_LAYER = 'tracksPanel';
export const TRACKS_PANEL_CLASS = 'of-tracks-panel';

export function createTracksPanelLayer() {
  return {
    name: TRACKS_PANEL_LAYER,
    html: `
      <div class="${TRACKS_PANEL_CLASS}" data-tracks-panel hidden>
        <div class="${TRACKS_PANEL_CLASS}__cols">
          <section class="${TRACKS_PANEL_CLASS}__col">
            <h3 class="${TRACKS_PANEL_CLASS}__heading">${tStatic('player.audio')}</h3>
            <ul class="${TRACKS_PANEL_CLASS}__list" data-tracks-audio></ul>
          </section>
          <section class="${TRACKS_PANEL_CLASS}__col">
            <h3 class="${TRACKS_PANEL_CLASS}__heading">${tStatic('player.subtitles')}</h3>
            <ul class="${TRACKS_PANEL_CLASS}__list" data-tracks-subs></ul>
          </section>
          <section class="${TRACKS_PANEL_CLASS}__col ${TRACKS_PANEL_CLASS}__col--picture">
            <h3 class="${TRACKS_PANEL_CLASS}__heading">${tStatic('player.quality')}</h3>
            <ul class="${TRACKS_PANEL_CLASS}__list" data-tracks-quality></ul>
            <div class="${TRACKS_PANEL_CLASS}__enhance" data-tracks-enhance-wrap hidden>
              <h4 class="${TRACKS_PANEL_CLASS}__heading ${TRACKS_PANEL_CLASS}__heading--sub">${tStatic('player.enhance')}</h4>
              <ul class="${TRACKS_PANEL_CLASS}__list" data-tracks-enhance></ul>
            </div>
          </section>
        </div>
      </div>
    `,
    style: {
      position: 'absolute',
      right: 'max(16px, env(safe-area-inset-right, 0px))',
      bottom: 'var(--of-up-next-bottom, calc(env(safe-area-inset-bottom, 0px) + clamp(72px, 12dvh, 110px)))',
      zIndex: '10050',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>,
  };
}
