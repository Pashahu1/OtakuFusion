export const getHomePage = async () => {
  const res = await fetch(
    "https://otaku-fusion-fizq.vercel.app/api/v2/hianime/home"
  );
  if (!res.ok) {
    throw new Error("Fetch uncorrect");
  }
  const data = await res.json();

  return data;
};
