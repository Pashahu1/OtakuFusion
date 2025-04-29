export const getEpisodes = async (id: string) => {
  const res = await fetch(
    `https://hianime-api-production.up.railway.app/api/v1/episodes/${id}`
  );
  const data = await res.json();
  console.log(data);
};
