export const getGenreAnime = async (name: string, page: number) => {
  const res = await fetch(`/api/v2/hianime/genre/${name}?page=${page}`);
  if (!res.ok) {
    throw new Error("failde");
  }
  const data = res.json();

  return data;
};
