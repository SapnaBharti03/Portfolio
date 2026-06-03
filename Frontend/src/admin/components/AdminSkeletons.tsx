import { Skeleton } from "@/components/portfolio/Skeleton";

export function ProfileFormSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden divide-y divide-border">
      <div className="p-6 lg:p-8 space-y-5">
        <Skeleton className="h-10 w-48" />
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="h-44 w-44 lg:w-52 rounded-lg shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
      <div className="p-6 lg:p-8 space-y-5">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-28" />
      </div>
      <div className="p-6 lg:p-8 space-y-5">
        <Skeleton className="h-10 w-28" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
      <div className="p-6 lg:p-8 space-y-5">
        <Skeleton className="h-10 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
      <div className="flex justify-end border-t border-border bg-surface/30 px-6 lg:px-8 py-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function CrudTableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="px-4 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
