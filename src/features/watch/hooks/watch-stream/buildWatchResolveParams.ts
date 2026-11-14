import type {
  WatchResolveOptions,
  WatchStreamAnimeMeta,
  WatchStreamResolveRefs,
} from './useWatchStreamTypes';

export function buildWatchResolveParams(
  activeOpts: WatchResolveOptions,
  streamAnime: WatchStreamAnimeMeta,
  preferredLang: 'sub' | 'dub',
  refs: WatchStreamResolveRefs,
) {
  const episodeNumber = Number(activeOpts.episodeId);
  const anilistFromMeta = (() => {
    const raw = streamAnime.id?.trim();
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
  })();

  return {
    anilistId: anilistFromMeta,
    malId:
      typeof streamAnime.mal_id === 'number' && streamAnime.mal_id > 0
        ? streamAnime.mal_id
        : undefined,
    keyword: streamAnime.title,
    localAnimeId: activeOpts.animeId,
    providerAniId: activeOpts.providerAnimeId ?? undefined,
    episodeEpToken: refs.episodeEpTokenRef.current?.trim() || undefined,
    episodeHasDub: refs.episodeHasDubRef.current,
    episode: episodeNumber,
    lang: preferredLang,
    streamProvider: 'hikka' as const,
    playbackAudio: activeOpts.playbackAudio,
    romajiTitle: streamAnime.romaji_title,
    japaneseTitle: streamAnime.japanese_title,
    synonyms: streamAnime.synonyms,
    showType: streamAnime.showType,
    episodeCount: streamAnime.episodeCount,
  };
}
