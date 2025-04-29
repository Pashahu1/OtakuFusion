export const getAnimeDetails = async (id: string) => {
  const response = await fetch(`http://localhost:3030/api/v1/anime/${id}`);
  const data = response.json();

  return data;
};
