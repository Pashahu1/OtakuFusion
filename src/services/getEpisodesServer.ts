export const getEpisodesServer = async (id: string) => {
  const res = await fetch(
    `https://anime-api-nu-ten.vercel.app/api/servers/${id}`
  );

  if (!res.ok) {
    throw new Error('failde');
  }

  const data = res.json();

  return data;
};
