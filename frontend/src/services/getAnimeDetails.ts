export const getAnimeDetails = async (animeId: string) => {
  const response = await fetch(`/api/v2/hianime/anime/${animeId}`);
  if (!response.ok) {
    throw new Error("");
  }
  const data = response.json();

  return data;
};
