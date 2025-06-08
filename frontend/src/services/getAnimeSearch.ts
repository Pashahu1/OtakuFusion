export const getAnimeSearch = async (query: string, page: number = 1) => {
  const res = await fetch(`/api/v2/hianime/search?q=${query}&page=1`);
  if (!res.ok) {
    throw new Error("Failed to fetch search results");
  }
  const data = await res.json();
  return data;
};
