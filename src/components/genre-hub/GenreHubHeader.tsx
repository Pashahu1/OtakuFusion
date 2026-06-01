import { getGenreMeta } from '@/shared/data/genre-hub';
import './GenreHubHeader.scss';

interface GenreHubHeaderProps {
  genre: string;
}

export function GenreHubHeader({ genre }: GenreHubHeaderProps) {
  const { description, Icon } = getGenreMeta(genre);

  return (
    <header className="genre-hub-header">
      <div className="genre-hub-header__icon-wrap" aria-hidden>
        <Icon className="genre-hub-header__icon" strokeWidth={1.75} />
      </div>
      <h1 className="genre-hub-header__title">{genre}</h1>
      <p className="genre-hub-header__description">{description}</p>
    </header>
  );
}
