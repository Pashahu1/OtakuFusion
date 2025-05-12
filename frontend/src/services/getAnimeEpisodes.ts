export const getAnimeEpisodes = async (animeId: string) => {
  const res = await fetch(`/api/v2/hianime/anime/${animeId}/episodes`);

  if (!res.ok) {
    throw new Error("can't get episodes");
  }

  const data = res.json();

  return data;
};
