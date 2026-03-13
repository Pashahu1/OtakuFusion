export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`min-h-[0.75rem] animate-pulse rounded-md bg-white/15 ${className ?? ''}`}
      aria-hidden
    />
  );
};
