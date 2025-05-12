export const getEpisodesServer = async (id: string) => {
  const res = await fetch(
    `/api/v2/hianime/episode/servers?animeEpisodeId=${id}`
  );

  if (!res.ok) {
    throw new Error("failde");
  }

  const data = res.json();

  return data;
};
