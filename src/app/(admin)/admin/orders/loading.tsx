import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-56 md:h-12 md:w-72" />
        <Skeleton className="h-5 w-full max-w-xl mt-2" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-16 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[40px] bg-card shadow-soft ring-1 ring-border overflow-hidden">
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-full md:w-44 rounded-full" />
            <Skeleton className="h-12 w-full md:w-44 rounded-full" />
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-4 pb-4 border-b border-border">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-7 gap-4 py-5 border-b border-border/50 items-center"
              >
                <Skeleton className="h-5 w-28" />
                <div className="flex items-center gap-3 col-span-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-9 rounded-full ml-auto" />
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-4 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-muted/20 p-4 ring-1 ring-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-20 w-full rounded-xl mb-4" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
