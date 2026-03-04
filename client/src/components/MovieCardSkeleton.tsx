import { Skeleton } from '@/components/ui/skeleton';

export default function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  );
}
