export const getAZList = (sortOption: string, page: number = 1) => {
  return fetch(`/api/v2/hianime/azlist/${sortOption}?page=${page}`)
    .then(res => res.json())
    .then(data => data);
};
