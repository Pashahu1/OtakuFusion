import "./SkeletonPreview.scss";

export const SkeletonPreview = () => {
  return (
    <div className="skeleton-preview">
      <div className="skeleton-preview__slide">
        <div className="skeleton-preview__overlay">
          <div>
            <h1 className="skeleton-preview__title" />
            <p className="skeleton-preview__text" />
            <span className="skeleton-preview__button" />
          </div>
        </div>
      </div>

      <div className="skeleton-preview__trending">
        <h2 className="skeleton-preview__trending-title" />
        <div className="skeleton-preview__trending-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
};
