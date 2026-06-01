import type Artplayer from 'artplayer';

export function bindPlayPauseLayerClick(userPausedRef: React.RefObject<boolean>) {
  return function (this: Artplayer) {
    if (this.playing) {
      userPausedRef.current = true;
      this.pause();
    } else {
      userPausedRef.current = false;
      this.play();
    }
  };
}

export function bindToggleControlsClick(this: Artplayer) {
  this.controls.show = !this.controls.show;
}
