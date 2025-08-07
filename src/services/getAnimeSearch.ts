export const getAnimeSearch = async (query: string) => {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  const res = await fetch(`${api_url}/search?keyword=${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  const data = await res.json();
  return data.results;
};
