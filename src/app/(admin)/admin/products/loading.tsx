import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Skeleton className="h-12 w-44 rounded-full" />
      </div>

      <div className="rounded-3xl bg-card p-4 md:p-5 shadow-soft ring-1 ring-border">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="h-11 w-full sm:w-40 rounded-2xl" />
          <Skeleton className="h-11 w-full sm:w-36 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[28px] bg-card p-3 ring-1 ring-border shadow-soft"
          >
            <Skeleton className="aspect-square w-full rounded-[20px]" />
            <Skeleton className="h-4 w-3/4 mt-3" />
            <Skeleton className="h-5 w-1/2 mt-2" />
            <Skeleton className="h-6 w-24 mt-2 rounded-full" />
            <div className="mt-3 flex gap-2 border-t border-border/40 pt-3">
              <Skeleton className="h-9 flex-1 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
