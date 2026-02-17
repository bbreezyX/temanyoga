import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-10">
      <div className="animate-fade-in-up">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-6 w-80 mt-2" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-24 mt-2" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[40px] bg-card p-4 md:p-8 shadow-soft ring-1 ring-border">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-4 border-b border-border/50"
            >
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-9 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}