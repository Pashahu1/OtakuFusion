import type Artplayer from 'artplayer';

/** After HLS failure `art.duration` resets but `.art-progress-tip` text may linger — clear duration flash. */
export function resetArtplayerProgressHoverUi(art: Artplayer) {
  try {
    const $player = art.template?.$player;
    if (!$player) return;
    $player.classList.remove('art-progress-hover');
    const tip = $player.querySelector('.art-progress-tip');
    if (tip) tip.textContent = '00:00';
  } catch {
    /* noop */
  }
}
