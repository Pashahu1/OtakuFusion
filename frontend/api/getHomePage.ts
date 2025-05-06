export const getHomePage = async () => {
  const resp = await fetch('/api/v2/hianime/home');
  if (!resp.ok) {
    throw new Error(`HTTP error! status: ${resp}`);
  }
  const data = await resp.json();

  return data.data;
};
