export const getServerEpisodes = async (episodeId: string) => {
  const res = await fetch(
    `https://getsources-production-56b4.up.railway.app/api/v1/servers?episodeId=${episodeId}`
  );
  const data = await res.json();

  return data;
};
