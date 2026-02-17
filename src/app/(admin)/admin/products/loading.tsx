import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>

      <div className="rounded-[40px] bg-card shadow-soft ring-1 ring-border overflow-hidden">
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-6 py-4">
            <Skeleton className="h-10 flex-1 max-w-md rounded-2xl" />
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="hidden md:block">
            <div className="grid grid-cols-6 gap-4 pb-4 border-b border-border text-[12px] font-black uppercase tracking-[0.1em]">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-6 gap-4 py-5 border-b border-border/50 items-center"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-muted/20 p-4 ring-1 ring-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}