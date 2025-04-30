export const getSources = async (
  episodeId: string,
  ep: string,
  server: string,
  category: string
) => {
  const res = await fetch(
    `https://getsources-production-56b4.up.railway.app/api/v1/servers?episodeId=${episodeId}&ep=${ep}&server=${server}&category=${category}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sources");
  }

  const data = await res.json();
  return data;
};
