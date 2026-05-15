import type Artplayer from 'artplayer';
import type { StreamingData, StreamQualityVariant } from '@/shared/types/StreamingTypes';
import { getStreamFullUrl, getStreamHeaders } from './playerStream';

function pickActiveQualityVariant(
  variants: StreamQualityVariant[],
  rawPlaylistUrl: string
): StreamQualityVariant {
  const raw = rawPlaylistUrl.trim();
  const exact = variants.find((v) => v.url.trim() === raw);
  if (exact) return exact;
  const sorted = [...variants].sort((a, b) => b.height - a.height);
  return sorted[0] ?? variants[0];
}

/**
 * Окремі HLS-плейлисти на кожну роздільність (Animepahe / Anilibria через Crysoline),
 * а не один master з ABR — перемикання через `switchUrl`, не через `hls.currentLevel`.
 */
export function attachStreamQualityMenu(
  art: Artplayer,
  streamInfo: StreamingData | null,
  rawPlaylistUrl: string
): void {
  const variants = streamInfo?.qualityVariants;
  if (!variants?.length || variants.length < 2) return;

  const raw = rawPlaylistUrl.trim();
  const active = pickActiveQualityVariant(variants, raw);
  const initialTooltip = `${active.height}p`;

  const selector = variants.map((v) => ({
    html: `${v.height}p`,
    default: v.url.trim() === raw,
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