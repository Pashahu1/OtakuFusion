export const getQtipInfo = async (animeId: string) => {
  const res = await fetch(`/api/v2/hianime/qtip/${animeId}`);
  if (!res.ok) {
    throw new Error("Failed");
  }
  const data = res.json();

  return data;
};
