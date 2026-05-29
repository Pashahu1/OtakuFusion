import type Artplayer from 'artplayer';
import type { StreamingData, StreamQualityVariant } from '@/shared/types/StreamingTypes';
import {
  DEFAULT_PLAYBACK_QUALITY_HEIGHT,
  pickPreferredQualityVariant,
} from './pickPreferredStreamQuality';
import { getStreamFullUrl, getStreamHeaders } from './playerStream';

/**
 * Separate HLS playlists per resolution (Anicore / Aniliberty via Crysoline),
 * not one ABR master — switch via `switchUrl`, not `hls.currentLevel`.
 */
export function attachStreamQualityMenu(
  art: Artplayer,
  streamInfo: StreamingData | null,
  rawPlaylistUrl: string
): void {
  const variants = streamInfo?.qualityVariants;
  if (!variants?.length || variants.length < 2) return;

  const raw = rawPlaylistUrl.trim();
  const preferred = pickPreferredQualityVariant(variants, raw);
  const active =
    variants.find((v) => v.url.trim() === preferred.url) ??
    variants.find((v) => v.height === DEFAULT_PLAYBACK_QUALITY_HEIGHT) ??
    variants[0];
  const initialTooltip = `${active.height}p`;

  const selector = variants.map((v) => ({
    html: `${v.height}p`,
    default: v.url.trim() === preferred.url,
  }));

  art.setting.add({
    name: 'streamQuality',
    html: 'Quality',
    tooltip: initialTooltip,
    position: 'right',
    selector,
    onSelect(item, _el, _event) {
      const m = /^(\d{3,4})p$/i.exec(String(item.html ?? '').trim());
      const height = m ? Number(m[1]) : NaN;
      const v = Number.isFinite(height)
        ? variants.find((x) => x.height === height)
        : undefined;
      if (!v?.url?.trim()) return;
      const t = art.currentTime;
      const wasPaused = art.playing === false;
      const headers = getStreamHeaders(streamInfo, v.url.trim());
      const nextFull = getStreamFullUrl(v.url.trim(), headers);
      const label = String(item.html ?? '').trim();
      const parent = (item as { $parent?: { tooltip?: string } }).$parent;
      if (parent && label) parent.tooltip = label;
      void art.switchUrl(nextFull).then(() => {
        if (Number.isFinite(t) && t > 0) {
          const dur = art.video?.duration ?? art.duration;
          const cap =
            Number.isFinite(dur) && dur > 0 ? Math.min(t, Math.max(0, dur - 0.05)) : t;
          art.currentTime = cap;
        }
        if (!wasPaused) art.play().catch(() => {});
      });
    },
  });
}