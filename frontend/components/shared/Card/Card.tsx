import Link from "next/link";
import { AnimeCard } from "../../../types/AnimeTypes";
import "./Card.scss";
type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  return (
    <article className="anime-card">
      <div
        className="anime-card__img-container"
        style={{
          backgroundImage: `url(${anime.poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <Link href={`/watch/${anime.id}`}>
        <h3 className="anime-card__title">{anime.title}</h3>
      </Link>
    </article>
  );
};
