export const getServerEpisodes = async (episodeId: string) => {
  const res = await fetch(
    `https://localhost:3033/api/v1/servers?episodeId=${episodeId}`
  );
  const data = await res.json();

  return data;
};
