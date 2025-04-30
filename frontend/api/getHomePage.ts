export const getHomePage = async () => {
  const res = await fetch(
    "https://hianime-api-production-2098.up.railway.app/api/v1/home"
  );
  if (!res.ok) {
    throw new Error("Fetch uncorrect");
  }
  const data = await res.json();

  return data;
};
