export const getAnimeCategory = (
  query: string,
  category: string,
  page: number = 1
) => {
  return fetch(
    `https://hianime-api-production-2098.up.railway.app/api/v1/${query}/${category}?page=${page}`
  )
    .then((res) => res.json())
    .then((data) => data);
};
