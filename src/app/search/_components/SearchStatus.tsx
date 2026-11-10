interface SearchStatusProps {
  title: string;
  message: string;
}

export function SearchStatus({ title, message }: SearchStatusProps) {
  return (
    <section className="search-page__status" aria-live="polite">
      <h2 className="search-page__status-title">{title}</h2>
      <p className="search-page__status-message">{message}</p>
    </section>
  );
}
