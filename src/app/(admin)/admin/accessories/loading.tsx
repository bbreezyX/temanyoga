import { Skeleton } from "@/components/ui/skeleton";

export default function AccessoriesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>

      <div className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 ring-1 ring-border"
            >
              <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}