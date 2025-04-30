"use client";
import { useEffect, useState } from "react";
import { getEpisodes } from "../../api/getEpisodes";

export const Watch: React.FC<{ animeId: string }> = ({ animeId }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем эпизоды при монтировании компонента
    const fetchEpisodes = async () => {
      const data = await getEpisodes(animeId);
      setEpisodes(data);
    };
    fetchEpisodes();
  }, [animeId]);

  const handleEpisodeClick = (episodeId: string) => {
    setSelectedEpisode(episodeId);
  };

  return (
    <div className="anime-player">
      <h1>Аниме Плеер</h1>

      <div className="episode-list">
        {episodes.map((episode) => (
          <div
            key={episode.episodeId}
            className="episode-item"
            onClick={() => handleEpisodeClick(episode.episodeId)}
          >
            <h2>{episode.title}</h2>
          </div>
        ))}
      </div>

      {/* Плеер для выбранной серии */}
      {selectedEpisode && (
        <div className="player">
          <h3>Просмотр эпизода: {selectedEpisode}</h3>
          {/* Встроенный плеер или iframe */}
          <iframe
            src={`https://example.com/watch/${selectedEpisode}`} // замените на реальный URL источника
            width="800"
            height="450"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
