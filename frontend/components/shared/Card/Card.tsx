import Link from "next/link";
import { AnimeCard } from "../../../types/AnimeTypes";

type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  return (
    <article>
      <img src={anime.poster} alt="Anime Cover" />
      <Link href={`/watch/${anime.id}`}>
        <h3>{anime.title}</h3>
      </Link>
    </article>
  );
};
