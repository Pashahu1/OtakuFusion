export const getAZList = (page: number = 1) => {
  return fetch(
    `https://hianime-api-production-2098.up.railway.app/api/v1/animes/az-list?page=${page}`
  )
    .then((res) => res.json())
    .then((data) => data);
};
