export const getSources = async (
  episodeId: string,
  server: string,
  category: string
) => {
  try {
    const res = await fetch(
      `https://getsources-production-56b4.up.railway.app/api/v1/source?episodeId=${episodeId}&server=${server}&category=${category}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch sources");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Ошибка при получении источников:", error);
  }
};
