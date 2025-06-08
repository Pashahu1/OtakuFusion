export const getCategory = async (name: string = "", page: number = 1) => {
  const res = await fetch(`/api/v2/hianime/category/${name}?page=${page}`);
  if (!res.ok) {
    throw new Error("failde");
  }
  const data = res.json();

  return data;
};
