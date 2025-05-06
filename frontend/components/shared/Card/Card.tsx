import Link from 'next/link';
import { AnimeCard } from '../../../types/AnimeCard';
import './Card.scss';
import Image from 'next/image';

type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  console.log(anime);
  return (
    <Link href={`/watch/${anime.id}`}>
      <article className="anime-card">
        <div className="anime-card__img-container">
          <Image
            src={anime.poster || '/default-poster.jpg'}
            alt={anime.name || 'Anime Poster'}
            fill
          />
        </div>
        <div className="anime-card__text">
          <h3 className="anime-card__title">{anime.name}</h3>
          <span>sub | dub</span>
        </div>
        <div className="anime-card--hover">
          <h2>{anime.name}</h2>
          <p>{anime.jname}</p>
          <span>dub: {anime.episodes?.dub}</span>
          <span>sub: {anime.episodes?.sub}</span>
        </div>
      </article>
    </Link>
  );
};
