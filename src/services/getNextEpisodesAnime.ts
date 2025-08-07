export const getNextEpisodesAnime = async (date: string) => {
  const resp = await fetch(
    `https://anime-api-nu-ten.vercel.app/api/schedule?date=${date}`
  );
  if (!resp.ok) {
    throw new Error(`HTTP error! status: ${resp}`);
  }
  const data = await resp.json();

  return data.results;
};
