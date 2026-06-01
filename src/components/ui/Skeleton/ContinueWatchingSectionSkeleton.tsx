import './ContinueWatchingSectionSkeleton.scss';

export function ContinueWatchingSectionSkeleton() {
  return (
    <section
      className="continue-watching-section-skeleton px-4 md:px-6 lg:px-10"
      aria-hidden
    >
      <div className="continue-watching-section-skeleton__title animate-pulse" />
      <div className="continue-watching-section-skeleton__row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="continue-watching-section-skeleton__slide">
            <div className="continue-watching-section-skeleton__thumb animate-pulse">
              <div className="continue-watching-section-skeleton__progress" />
            </div>
            <div className="continue-watching-section-skeleton__series animate-pulse" />
            <div className="continue-watching-section-skeleton__episode animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
