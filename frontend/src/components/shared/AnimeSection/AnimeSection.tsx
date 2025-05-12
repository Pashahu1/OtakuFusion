import { AnimeCard } from "../../../types/AnimeCard";
import { Card } from "../Card/Card";
import "./AnimeSection.scss";

type Props = {
  title: string;
  catalog: AnimeCard[];
};

export const AnimeSection: React.FC<Props> = ({ title, catalog }) => {
  return (
    <section className="anime-section">
      <div className="anime-section__content">
        <h1 className="anime-section__title">{title}</h1>
        <div className="anime-section__container">
          {catalog.map((anime) => (
            <Card key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </section>
  );
};
