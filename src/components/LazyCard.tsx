import { memo, type ReactNode } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyCardProps {
  children: ReactNode;
  className?: string;
  skeletonClassName?: string;
  skeletonHeight?: string;
}

/**
 * Lazy-loading card wrapper that only renders content when visible in viewport
 */
export const LazyCard = memo(function LazyCard({
  children,
  className,
  skeletonClassName,
  skeletonHeight = 'h-48',
}: LazyCardProps) {
  const { ref, isVisible, hasLoaded } = useLazyLoad<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? (
        <div className={cn(
          'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}>
          {children}
        </div>
      ) : (
        <Skeleton className={cn(skeletonHeight, 'w-full rounded-xl bg-white/5', skeletonClassName)} />
      )}
    </div>
  );
});

/**
 * Placeholder skeleton for cards
 */
export const CardSkeleton = memo(function CardSkeleton({ 
  className,
  rows = 3 
}: { 
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn('p-4 rounded-xl bg-white/5 border border-white/10 space-y-3', className)}>
      <Skeleton className="h-6 w-3/4 bg-white/10" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 bg-white/5" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
    </div>
  );
});

export default LazyCard;