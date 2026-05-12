/**
 * TanStack Query: ключі та staleTime для даних AnimeKai (епізоди одного ani_id).
 * Використовуйте при поступовому переведенні завантажень на useQuery.
 */
export const KAI_EPISODES_STALE_MS = 30 * 60 * 1000;

export function kaiEpisodesQueryKey(aniId: string): readonly ['kai', 'episodes', string] {
  return ['kai', 'episodes', aniId.trim()] as const;
}
