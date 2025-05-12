export const getProducerAnime = async (name: string, page: number) => {
  const res = await fetch(`/api/v2/hianime/producer/${name}?page=${page}`);

  if (!res.ok) {
    throw new Error("faild to fething data");
  }

  const data = res.json();

  return data;
};
