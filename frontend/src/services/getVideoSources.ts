export const getVideoSources = async (
  animeEpisodeId: string,
  server: string,
  category: string
) => {
  const response = await fetch(
    `/api/v2/hianime/episode/sources?animeEpisodeId=${animeEpisodeId}&server=${server}&category=${category}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video sources");
  }

  const data = await response.json();
  return data;
};
