export const getCategory = async (name: string, page: number = 1) => {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  const res = await fetch(`${api_url}/${name}?page=${page}`);
  if (!res.ok) {
    throw new Error('failde');
  }
  const data = res.json();

  return data;
};
