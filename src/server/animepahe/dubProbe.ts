import { getAnimePaheSourcesCached } from '@/server/animepahe/sourcesCached';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { inferAnimepaheSourceIsDub } from '@/services/animepahe/inferAnimepaheSourceIsDub';

function sourcesPayloadHasDub(payload: {
  sources?: Array<{ isDub?: boolean; quality?: string }>;
  download?: Array<{ quality?: string }>;
}): boolean {
  const list = Array.isArray(payload.sources) ? payload.sources : [];
  if (list.some((s) => inferAnimepaheSourceIsDub(s))) return true;
  const downloads = Array.isArray(payload.download) ? payload.download : [];
  return downloads.some((d) => inferAnimepaheSourceIsDub(d));
}

function applySeriesDubHint(episodes: EpisodesTypes[], hasSeriesDub: boolean): EpisodesTypes[] {
  if (!hasSeriesDub || !episodes.length) return episodes;
  return episodes.map((ep) => {
    const hasSub = ep.hasSub !== false;
    const variant =
      hasSub && hasSeriesDub ? 'Sub | Dub' : hasSeriesDub ? 'Dub' : ep.variant ?? 'Sub';
    return { ...ep, hasDub: true, variant };
  });
}

function readDubProbeTimeoutMs(): number {
  const raw = Number(process.env.ANIMEPAHE_DUB_PROBE_TIMEOUT_MS);
  if (Number.isFinite(raw) && raw >= 800 && raw <= 20_000) return Math.floor(raw);
  return 4500;
}

async function enrichEpisodesWithSeriesDubInner(
  seriesId: string,
  episodes: EpisodesTypes[]
): Promise<EpisodesTypes[]> {
  const hash = episodes[0]?.ep_token?.trim();
  if (!hash) return episodes;
  const payload = await getAnimePaheSourcesCached(seriesId.trim(), hash);
  if (sourcesPayloadHasDub(payload)) {
    return applySeriesDubHint(episodes, true);
  }
  return episodes;
}

/**
 * ╨₧╨┤╨╕╨╜ ╨╖╨░╨┐╨╕╤é `sources` ╨┤╨╗╤Å ╨┐╨╡╤Ç╤ê╨╛╨│╨╛ ╨╡╨┐╤û╨╖╨╛╨┤╤â: ╤Å╨║╤ë╨╛ ╤ö ╨┤╤â╨▒ ╤â ╨▓╤û╨┤╨┐╨╛╨▓╤û╨┤╤û Crysoline ΓÇö ╨┐╨╛╨╖╨╜╨░╤ç╨░╤ö╨╝╨╛ ╨▓╨╡╤ü╤î ╤ü╨┐╨╕╤ü╨╛╨║ (╤ü╨╡╤Ç╤û╨░╨╗).
 * ╨ƒ╨╛╨╝╨╕╨╗╨║╨╕ (429 ╤é╨╛╤ë╨╛) ╤û╨│╨╜╨╛╤Ç╤â╤ö╨╝╨╛ ΓÇö ╨┐╨╛╨▓╨╡╤Ç╤é╨░╤ö╨╝╨╛ `episodes` ╨▒╨╡╨╖ ╨╖╨╝╤û╨╜.
 * ╨ó╨░╨╣╨╝╨░╤â╤é ╨╖╨░ ╨╖╨░╨╝╨╛╨▓╤ç. 4.5 ╤ü ΓÇö ╨║╨░╤é╨░╨╗╨╛╨│ ╨╜╨╡ ╨▒╨╗╨╛╨║╤â╤ö╤é╤î╤ü╤Å ╨╜╨░ ╨┐╨╛╨▓╤û╨╗╤î╨╜╨╛╨╝╤â sources.
 */
export async function enrichEpisodesWithSeriesDubIfNeeded(
  seriesId: string,
  episodes: EpisodesTypes[]
): Promise<EpisodesTypes[]> {
  if (!episodes.length) return episodes;
  const timeoutMs = readDubProbeTimeoutMs();
  try {
    return await Promise.race([
      enrichEpisodesWithSeriesDubInner(seriesId, episodes),
      new Promise<EpisodesTypes[]>((resolve) => {
        setTimeout(() => resolve(episodes), timeoutMs);
      }),
    ]);
  } catch {
    return episodes;
  }
}
