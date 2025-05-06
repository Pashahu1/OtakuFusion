// export const getEpisodes = async (id: string): Promise> => {
//   try {
//     const res = await fetch(
//       `https://hianime-api-production-2098.up.railway.app/api/v1/episodes/${id}`
//     );

//     if (!res.ok) {
//       throw new Error(`Ошибка сервера: ${res.statusText}`);
//     }

//     const data: EpisodesResponse = await res.json();

//     return Array.isArray(data.episodes) ? data.episodes : [];
//   } catch (error) {
//     console.error("Ошибка при получении эпизодов:", error);
//     return [];
//   }
// };
