export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-[#3a3c45]/50 rounded-md ${className}`}
    ></div>
  );
};
