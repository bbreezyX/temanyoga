import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
      <div className="rounded-[32px] sm:rounded-[40px] bg-card p-6 sm:p-8 border border-border/50 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56 mt-2" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="flex justify-between gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-2 flex-1 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[32px] bg-card p-6 ring-1 ring-border shadow-soft">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] bg-card p-6 ring-1 ring-border shadow-soft">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-full rounded-2xl mb-3" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[32px] bg-card p-6 ring-1 ring-border shadow-soft">
            <Skeleton className="h-6 w-36 mb-4" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div className="rounded-[32px] bg-card p-6 ring-1 ring-border shadow-soft">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
