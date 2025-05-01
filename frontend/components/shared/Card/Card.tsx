import Link from "next/link";
import { AnimeCard } from "../../../types/AnimeTypes";
import "./Card.scss";

type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  return (
    <article className="anime-card">
      <img className="anime-card__img" src={anime.poster} alt="Anime Cover" />
      <Link href={`/watch/${anime.id}`}>
        <h3 className="anime-card__title">{anime.title}</h3>
      </Link>
    </article>
  );
};
