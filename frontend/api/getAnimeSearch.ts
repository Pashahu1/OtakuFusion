export const getAnimeSearch = (page: number = 1, keyword: string) => {
  return fetch(
    `https://hianime-api-production-2098.up.railway.app/api/v1/search?keyword=${keyword}&page=${page}`
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch(() => new Error("this is invalid request"));
};
