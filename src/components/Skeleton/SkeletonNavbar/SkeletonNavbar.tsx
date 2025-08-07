import "./SkeletonNavbar.scss";

export function SkeletonNavbar() {
  return (
    <header className="skeleton-navbar">
      <nav className="skeleton-navbar__nav">
        <div className="skeleton-navbar__nav-content">
          <div className="skeleton-navbar__link shimmer" />
          <div className="skeleton-navbar__link shimmer" />
          <div className="skeleton-navbar__link shimmer" />
          <div className="skeleton-navbar__link shimmer" />
        </div>

        <div className="skeleton-navbar__nav-list">
          <div className="skeleton-navbar__logo shimmer" />
          <div className="skeleton-navbar__logo shimmer" />
        </div>
      </nav>
    </header>
  );
}
