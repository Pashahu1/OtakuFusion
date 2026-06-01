const SKIP_INTRO_OUTRO_HTML = `
  <div class="of-skip-segment-inner" style="
    display:flex;
    justify-content:flex-end;
    pointer-events:auto;
  ">
    <button type="button" data-skip-segment style="
      padding:10px 16px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,0.1);
      cursor:pointer;
      font-weight:600;
      font-size:13px;
      color:rgba(243,244,246,0.96);
      background:rgba(24,24,27,0.94);
      backdrop-filter:blur(10px);
      -webkit-backdrop-filter:blur(10px);
      box-shadow:0 12px 40px rgba(0,0,0,0.45);
      font-family:system-ui,-apple-system,sans-serif;
      letter-spacing:0.02em;
      transition:background 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease;
    ">Skip OP</button>
  </div>
`;

export function createSkipIntroOutroLayer() {
  return {
    name: 'skipIntroOutro',
    html: SKIP_INTRO_OUTRO_HTML,
    style: {
      display: 'none',
      position: 'absolute',
      /** Same offset above controls: not 22% from bottom (too high). */
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(56px, 11dvh, 96px))',
      right: 'max(16px, env(safe-area-inset-right, 0px))',
      left: 'auto',
      maxWidth: 'min(360px, 94vw)',
      zIndex: '10002',
      pointerEvents: 'none',
    },
  };
}
