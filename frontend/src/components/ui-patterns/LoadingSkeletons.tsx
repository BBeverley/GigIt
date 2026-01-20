import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton(props: { rows?: number }) {
  const rows = props.rows ?? 6;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="rounded-2xl border bg-card">
        <div className="grid grid-cols-12 gap-3 border-b p-4">
          <Skeleton className="col-span-3 h-4" />
          <Skeleton className="col-span-4 h-4" />
          <Skeleton className="col-span-3 h-4" />
          <Skeleton className="col-span-2 h-4" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 border-b p-4 last:border-b-0">
            <Skeleton className="col-span-3 h-4" />
            <Skeleton className="col-span-4 h-4" />
            <Skeleton className="col-span-3 h-4" />
            <Skeleton className="col-span-2 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

