import { AnimeItem } from "../../../types/AnimeTypes";
import { Card } from "../Card/Card";
import "./AnimeSection.scss";
type Props = {
  title: string;
  catalog: AnimeItem[];
};

export const AnimeSection: React.FC<Props> = ({ title, catalog }) => {
  return (
    <section className="anime-section">
      <div className="anime-section__content">
        <h1 className="anime-section__title">{title}</h1>
        <div className="anime-section__container">
          {catalog.map((anime) => (
            <Card
              key={anime.id}
              anime={{
                ...anime,
                alternativeTitle: anime.alternativeTitle || "N/A",
                episodes: anime.episodes || 0,
                poster: anime.poster || "default-poster.jpg",
                type: anime.type || "Unknown",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
