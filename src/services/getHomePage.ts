export const getHomePage = async () => {
  const resp = await fetch('https://anime-api-nu-ten.vercel.app/api/', {
    next: { revalidate: 60 },
  });

  if (!resp.ok) {
    throw new Error(`HTTP error! status: ${resp.status}`);
  }
  const data = await resp.json();

  return data.results;
};
