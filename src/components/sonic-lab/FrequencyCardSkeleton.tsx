import { Skeleton } from '@/components/ui/skeleton';

export default function FrequencyCardSkeleton() {
  return (
    <div className="min-w-[200px] p-5 rounded-xl border-2 border-border/50 bg-card space-y-3">
      <Skeleton className="h-7 w-16 bg-foreground/10 rounded" />
      <Skeleton className="h-4 w-24 bg-foreground/5 rounded" />
      <Skeleton className="h-3 w-full bg-foreground/5 rounded" />
      <Skeleton className="h-3 w-3/4 bg-foreground/5 rounded" />
      <div className="flex justify-end pt-2">
        <Skeleton className="h-8 w-8 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}
