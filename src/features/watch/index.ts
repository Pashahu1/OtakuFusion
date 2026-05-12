/**
 * Фіча «перегляд»: AniList-метадані + AnimeKai (резолв, епізоди, стрім).
 * Хуки лежать у `hooks/`; сторінка `app/watch/[id]` імпортує звідси або з `@/hooks/*` (реекспорт).
 */
export { useWatch } from './hooks/useWatch';
export { useWatchAnime, type UseWatchAnimeReturn } from './hooks/useWatchAnime';
export {
  useWatchStream,
  type UseWatchStreamReturn,
} from './hooks/useWatchStream';
export { useWatchPageEffects } from './hooks/useWatchPageEffects';
