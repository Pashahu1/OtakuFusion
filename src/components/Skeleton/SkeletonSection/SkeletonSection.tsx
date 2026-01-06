import "./SkeletonSection.scss";

export default function SkeletonSection() {
  return (
    <div className="skeleton-section">
      <div className="skeleton-section__title" />
      <div className="skeleton-section__grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}
