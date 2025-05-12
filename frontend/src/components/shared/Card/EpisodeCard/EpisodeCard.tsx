export const EpisodesCard = ({ episode }: any) => {
  return (
    <article data-episode-number={episode.number} className="episode-card">
      <span className="episode-card--filler">
        {episode.isFiller ? "F" : ""}
      </span>
      <div>Watch</div>
      <div className="episode-card__content">
        <div className="episode-card__summary">
          <div className="episode-card__title">
            <span className="episode-card__number">E:{episode.number}</span>
            {" - "}
            <span className="episode-card__text">{episode.title}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
