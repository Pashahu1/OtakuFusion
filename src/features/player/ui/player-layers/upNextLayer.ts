const UP_NEXT_HTML = `
  <div class="of-up-next-inner" style="
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px 12px;
    border-radius:12px;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(24,24,27,0.94);
    backdrop-filter:blur(10px);
    -webkit-backdrop-filter:blur(10px);
    box-shadow:0 12px 40px rgba(0,0,0,0.45);
    pointer-events:auto;
    font-family:system-ui,-apple-system,sans-serif;
    max-width:min(360px, 94vw);
  ">
    <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;">
      <span style="
        font-size:11px;
        font-weight:600;
        letter-spacing:0.06em;
        text-transform:uppercase;
        color:rgba(255,255,255,0.55);
      ">Up next</span>
      <span data-up-next-title style="
        font-size:13px;
        font-weight:600;
        color:rgba(243,244,246,0.96);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      ">Next episode</span>
    </div>
    <button type="button" data-up-next-play style="
      flex-shrink:0;
      padding:8px 14px;
      border-radius:10px;
      border:none;
      cursor:pointer;
      font-weight:600;
      font-size:13px;
      color:#fff;
      background:#ff640a;
      letter-spacing:0.02em;
      transition:background 0.2s ease,transform 0.15s ease;
    ">Play</button>
  </div>
`;

export function createUpNextLayer() {
  return {
    name: 'upNext',
    html: UP_NEXT_HTML,
    style: {
      display: 'none',
      position: 'absolute',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(56px, 11dvh, 96px))',
      left: 'max(16px, env(safe-area-inset-left, 0px))',
      right: 'auto',
      zIndex: '10002',
      pointerEvents: 'none',
    },
  };
}
