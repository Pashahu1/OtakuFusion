export const getEpisodes = async (id: string) => {
  try {
    const res = await fetch(
      `https://getsources-production-56b4.up.railway.app/api/v1/episodes/${id}`
    );

    if (!res.ok) {
      throw new Error(`Ошибка сервера: ${res.statusText}`);
    }

    const data = await res.json();

    // ✅ ВНИМАНИЕ: доступ к массиву через data.episodes.episodes
    return data.episodes.episodes;
  } catch (error) {
    console.error("Ошибка при получении эпизодов:", error);
    return [];
  }
};
