import { cn } from '@/lib/utils';
import './Skeleton.scss';

type SkeletonProps = {
  className?: string;
  animation?: boolean;
}

export const Skeleton = ({ className, animation = true, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-gray-400 rounded-3xl',
        animation ? 'shimmer-effect' : '',
        className
      )}
      {...props}
    />
  );
}
