export const getSources = async (
  episodeId: string,
  ep: string,
  server: string,
  category: string
) => {
  const res = await fetch(
    `http://localhost:3033/api/v1/servers?episodeId=${episodeId}&ep=${ep}&server=${server}&category=${category}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sources");
  }

  const data = await res.json();
  return data;
};
