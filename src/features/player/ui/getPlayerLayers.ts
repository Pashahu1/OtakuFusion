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
        /** Same offset above controls: not 22% from bottom (too high). */
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
