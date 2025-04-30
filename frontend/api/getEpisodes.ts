export const getEpisodes = async (id: string) => {
  const res = await fetch(
    `https://getsources-production-56b4.up.railway.app/api/v1/episodes/${id}`
  );
  const data = await res.json();
  console.log(data);
};
