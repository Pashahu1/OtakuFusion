import "./SkeletonCard.scss";
export const SkeletonCard = () => {
  return (
    <article className="anime-card skeleton">
      <div className="anime-card__img-container skeleton__block" />
      <div className="anime-card__text">
        <div className="anime-card__title skeleton__line" />
      </div>
      <div className="anime-card--hover" />
    </article>
  );
};
