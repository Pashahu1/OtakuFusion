export const getAnimeDetails = async (animeId: string) => {
  const response = await fetch(`/api/v2/hianime/anime/${animeId}`);
  const data = response.json();

  return data;
};
