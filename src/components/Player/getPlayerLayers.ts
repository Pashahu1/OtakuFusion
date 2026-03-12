import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import Artplayer from 'artplayer';
import { backwardIcon, forwardIcon } from './PlayerIcons';

export function getPlayerLayers(
  currentEpisodeIndex: number,
  episodes: EpisodesTypes[],
  playNext: (episodeId: string) => void,
  userPausedRef: React.RefObject<boolean>,
  intro: Segment | null,
  outro: Segment | null,
) {
  return [
    {
      name: 'siteLogo',
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
      name: 'skipIntro',
      html: '<div class="skip-intro-btn">Skip Intro</div>',
      style: {
        position: 'absolute',
        bottom: '90px',
        right: '30px',
        padding: '10px 18px',
        background: 'rgba(40, 40, 40, 0.55)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'none',
        zIndex: '9999',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
      },
      click: function (this: Artplayer) {
        if (intro) this.currentTime = intro.end;
      },
    },
    {
      name: 'skipOutro',
      html: '<div class="skip-outro-btn">Next Episode</div>',
      style: {
        position: 'absolute',
        bottom: '90px',
        right: '30px',
        padding: '10px 18px',
        background: 'rgba(40, 40, 40, 0.55)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'none',
        zIndex: '9999',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
      },
      click: function (this: Artplayer) {
        const idx = currentEpisodeIndex ?? -1;
        const next = episodes?.[idx + 1];
        if (next) {
          const nextId = next.id.match(/ep=(\d+)/)?.[1];
          if (nextId) playNext(nextId);
        } else if (outro) {
          this.currentTime = outro.end;
        }
      },
    },
  ];
}
