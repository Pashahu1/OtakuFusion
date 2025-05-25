export const getVideoSources = async (
  animeEpisodeId: string,
  server: string = "hd-2",
  category: string = "dub"
) => {
  const proxy = "https://cors-anywhere-lekg.onrender.com/";
  try {
    const response = await fetch(
      `${proxy}https://aniwatch-api-production-68fd.up.railway.app/api/v2/hianime/episode/sources?animeEpisodeId=${animeEpisodeId}&server=${server}&category=${category}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
};
