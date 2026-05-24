interface HeroSlideGenresProps {
  genres: string[];
}

export function HeroSlideGenres({ genres }: HeroSlideGenresProps) {
  if (!genres.length) return null;

  return (
    <ul className="hero__genres" aria-label="Genres">
      {genres.map((genre) => (
        <li key={genre}>
          <span className="hero__genre-pill">{genre}</span>
        </li>
      ))}
    </ul>
  );
}
