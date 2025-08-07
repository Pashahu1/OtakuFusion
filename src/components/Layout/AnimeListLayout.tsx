import "./AnimeListLayout.scss";

type props = {
  title?: string;
  children: React.ReactNode;
};

export const AnimeListLayout = ({ children, title }: props) => {
  return (
    <div className="category-page">
      {title && <h1 className="category-page__title">{`${title} Page`}</h1>}
      <div className="category-page__content">{children}</div>
    </div>
  );
};
