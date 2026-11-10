import type Artplayer from 'artplayer';

import { runArtplayerPlayNext } from '@/features/player/lib/artplayer-near-end-state';
import { clickAudioSubtitlesControl } from '../netflix-tracks/attachNetflixTracksPanel';
import { PLAYER_SKIP_SECONDS } from '../playerConstants';
import {
  audioSubtitlesIcon,
  backward10Icon,
  forward10Icon,
  nextEpisodeIcon,
} from '../PlayerIcons';
import {
  bindNetflixVolumeControl,
  NETFLIX_VOLUME_CONTROL_HTML,
} from '../player-volume/netflixVolumeControl';
import { skipPlaybackBy } from './skipPlaybackBy';

type ArtplayerControlOption = NonNullable<
  ConstructorParameters<typeof Artplayer>[0]['controls']
>[number];

export function getArtplayerSkipControls(): ArtplayerControlOption[] {
  return [
    {
      name: 'skipBack',
      position: 'left',
      index: 11,
      html: backward10Icon,
      tooltip: `−${PLAYER_SKIP_SECONDS}s`,
      click() {
        skipPlaybackBy(this, -PLAYER_SKIP_SECONDS);
      },
    },
    {
      name: 'skipForward',
      position: 'left',
      index: 12,
      html: forward10Icon,
      tooltip: `+${PLAYER_SKIP_SECONDS}s`,
      click() {
        skipPlaybackBy(this, PLAYER_SKIP_SECONDS);
      },
    },
    {
      name: 'ofVolume',
      position: 'left',
      index: 15,
      html: NETFLIX_VOLUME_CONTROL_HTML,
      mounted(el) {
        bindNetflixVolumeControl(this, el);
      },
    },
    {
      name: 'nextEpisode',
      position: 'right',
      index: 50,
      html: nextEpisodeIcon,
      mounted(el) {
        el.classList.add('is-hidden');
      },
      click() {
        runArtplayerPlayNext(this);
      },
    },
    {
      name: 'audioSubtitles',
      position: 'right',
      index: 65,
      html: audioSubtitlesIcon,
      tooltip: 'Audio & Subtitles',
      click(_component, event) {
        clickAudioSubtitlesControl(this, event);
      },
    },
  ];
}
