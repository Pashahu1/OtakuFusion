import './Skeleton.scss';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`ui-skeleton ${className ?? ''}`.trim()}
      aria-hidden
    />
  );
};
