export const getAnimeDetails = async (id: string) => {
  const response = await fetch(
    `https://hianime-api-production-2098.up.railway.app/api/v1/anime/${id}`
  );
  const data = response.json();

  return data;
};
