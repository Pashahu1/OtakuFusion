export const getEpisodes = async (id: string) => {
  try {
    const res = await fetch(
      `https://getsources-production-56b4.up.railway.app/api/v1/episodes/${id}`
    );

    if (!res.ok) {
      throw new Error(`Ошибка сервера: ${res.statusText}`);
    }

    const data = await res.json();

    console.log(data); // Выводим данные эпизодов для отладки
    return data.episodes; // Возвращаем массив эпизодов
  } catch (error) {
    console.error("Ошибка при получении эпизодов:", error);
    return []; // Возвращаем пустой массив, чтобы избежать проблем с обработкой отсутствующих данных
  }
};
