import Artplayer from 'artplayer';

const SITE_LOGO_HTML = `
  <div style="
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:4px;
    padding:10px 16px;
    border-radius:14px;
    background:linear-gradient(135deg, rgba(20,20,20,0.75), rgba(40,40,40,0.55));
    backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 8px 30px rgba(0,0,0,0.45),
      inset 0 0 15px rgba(255,255,255,0.03);
  ">
    <div style="
      font-size:20px;
      font-weight:800;
      letter-spacing:0.5px;
      font-family:system-ui, -apple-system, sans-serif;
    ">
      <span style="
        background:linear-gradient(90deg,#ff7a18,#ffb347);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
      ">Otaku</span>
      <span style="color:#ffffff;">Fusion</span>
    </div>
    <div style="
      font-size:12px;
      font-weight:500;
      color:rgba(255,255,255,0.75);
      letter-spacing:0.4px;
    ">
      ✨ Enjoy watching with Us
    </div>
  </div>
`;

export function createSiteLogoLayer() {
  return {
    name: 'siteLogo',
    disable: Artplayer.utils.isMobile,
    html: SITE_LOGO_HTML,
    style: {
      position: 'absolute',
      top: '18px',
      right: '20px',
      opacity: '1',
      transform: 'translateY(-10px) scale(0.95)',
      transition: 'all 0.6s cubic-bezier(.22,.61,.36,1)',
      pointerEvents: 'none',
    },
  };
}
