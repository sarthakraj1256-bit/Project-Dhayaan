import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder for a FrequencyCard in the horizontal scroll grid.
 */
export default function FrequencyCardSkeleton() {
  return (
    <div className="min-w-[200px] p-5 rounded-xl border-2 border-white/10 bg-white/[0.02] space-y-3">
      <Skeleton className="h-7 w-16 bg-white/10 rounded" />
      <Skeleton className="h-4 w-24 bg-white/5 rounded" />
      <Skeleton className="h-3 w-full bg-white/5 rounded" />
      <Skeleton className="h-3 w-3/4 bg-white/5 rounded" />
      <div className="flex justify-end pt-2">
        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
