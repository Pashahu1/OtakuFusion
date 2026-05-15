import Artplayer from 'artplayer';
import { backwardIcon, forwardIcon } from './PlayerIcons';

export function getPlayerLayers(userPausedRef: React.RefObject<boolean>) {
  return [
    {
      name: 'siteLogo',
      disable: Artplayer.utils.isMobile,
      html: `
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
        `,
      style: {
        position: 'absolute',
        top: '18px',
        right: '20px',
        opacity: '1',
        transform: 'translateY(-10px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(.22,.61,.36,1)',
        pointerEvents: 'none',
      },
    },
    {
      html: '',
      style: {
        position: 'absolute',
        left: '50%',
        top: '0',
        width: '20%',
        height: '100%',
        transform: 'translateX(-50%)',
      },
      disable: !Artplayer.utils.isMobile,
      click: function (this: Artplayer) {
        if (this.playing) {
          userPausedRef.current = true;
          this.pause();
        } else {
          userPausedRef.current = false;
          this.play();
        }
      },
    },
    {
      name: 'videoToggle',
      html: '',
      style: {
        position: 'absolute',
        inset: '0',
        zIndex: '100',
        cursor: 'pointer',
      },
      disable: Artplayer.utils.isMobile,
      click: function (this: Artplayer) {
        if (this.playing) {
          userPausedRef.current = true;
          this.pause();
        } else {
          userPausedRef.current = false;
          this.play();
        }
      },
    },
    {
      name: 'rewind',
      html: '',
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '40%',
        height: '100%',
      },
      disable: !Artplayer.utils.isMobile,
      click: function (this: Artplayer) {
        this.controls.show = !this.controls.show;
      },
    },
    {
      name: 'forward',
      html: '',
      style: {
        position: 'absolute',
        right: '0',
        top: '0',
        width: '40%',
        height: '100%',
      },
      disable: !Artplayer.utils.isMobile,
      click: function (this: Artplayer) {
        this.controls.show = !this.controls.show;
      },
    },
    {
      name: 'backwardIcon',
      html: backwardIcon,
      style: {
        position: 'absolute',
        left: '25%',
        top: '50%',
        transform: 'translate(50%,-50%)',
        opacity: '0',
        transition: 'opacity 0.5s ease-in-out',
      },
      disable: !Artplayer.utils.isMobile,
    },
    {
      name: 'forwardIcon',
      html: forwardIcon,
      style: {
        position: 'absolute',
        right: '25%',
        top: '50%',
        transform: 'translate(50%, -50%)',
        opacity: '0',
        transition: 'opacity 0.5s ease-in-out',
      },
      disable: !Artplayer.utils.isMobile,
    },
    {
      name: 'upNext',
      html: `
        <div class="of-up-next-inner" style="
          display:flex;
          flex-direction:column;
          gap:10px;
          padding:16px 18px;
          border-radius:12px;
          background:rgba(18,18,22,0.92);
          border:1px solid rgba(255,255,255,0.12);
          box-shadow:0 12px 40px rgba(0,0,0,0.55);
          color:#fff;
          font-family:system-ui,-apple-system,sans-serif;
        ">
          <div style="font-size:13px;font-weight:600;opacity:0.85;letter-spacing:0.02em;">Наступний епізод</div>
          <div data-upnext-countdown style="font-size:22px;font-weight:800;line-height:1.2;">15 с</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
            <button type="button" data-upnext-play style="
              flex:1;
              min-width:108px;
              padding:9px 14px;
              border-radius:8px;
              border:none;
              cursor:pointer;
              font-weight:700;
              font-size:14px;
              color:#111;
              background:linear-gradient(135deg,#ffb347,#ff7a18);
            ">Зараз</button>
            <button type="button" data-upnext-cancel style="
              flex:1;
              min-width:108px;
              padding:9px 14px;
              border-radius:8px;
              border:1px solid rgba(255,255,255,0.25);
              cursor:pointer;
              font-weight:600;
              font-size:14px;
              color:#f3f3f3;
              background:rgba(255,255,255,0.06);
            ">Скасувати</button>
          </div>
        </div>
      `,
      style: {
        display: 'none',
        position: 'absolute',
        bottom: 'calc(14% + env(safe-area-inset-bottom, 0px))',
        right: 'max(16px, env(safe-area-inset-right, 0px))',
        left: 'auto',
        maxWidth: 'min(340px, 92vw)',
        zIndex: '10001',
        pointerEvents: 'auto',
      },
    },
    {
      name: 'skipIntroOutro',
      html: `
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
      `,
      style: {
        display: 'none',
        position: 'absolute',
        /** Однаково «над» контролами: не 22% від низу (занадто високо). */
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(56px, 11dvh, 96px))',
        right: 'max(16px, env(safe-area-inset-right, 0px))',
        left: 'auto',
        maxWidth: 'min(360px, 94vw)',
        zIndex: '10002',
        pointerEvents: 'none',
      },
    },
  ];
}
