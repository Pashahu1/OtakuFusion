export const getHomePage = async () => {
  const res = await fetch("http://localhost:3030/api/v1/home");
  if (!res.ok) {
    throw new Error("Fetch uncorrect");
  }
  const data = await res.json();

  return data;
};
