import './DiscoverBrowseHeader.scss';

interface DiscoverBrowseHeaderProps {
  title: string;
  description: string;
}

export function DiscoverBrowseHeader({
  title,
  description,
}: DiscoverBrowseHeaderProps) {
  return (
    <header className="discover-browse-header genre-browse-layout__toolbar">
      <h1 className="discover-browse-header__title">{title}</h1>
      <p className="discover-browse-header__description">{description}</p>
    </header>
  );
}
