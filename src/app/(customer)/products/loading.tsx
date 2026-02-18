import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="bg-white min-h-screen text-slate-900 pb-24">
      <div className="pt-32 px-6 md:px-8 max-w-7xl mx-auto text-center space-y-6">
        <Skeleton className="h-6 w-32 rounded-full mx-auto" />
        <Skeleton className="h-20 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      <div className="mt-24 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 mb-12 md:mb-16">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`relative flex flex-col gap-3 ${i % 2 !== 0 ? "md:translate-y-12" : ""}`}
            >
              <Skeleton className="aspect-[3/4] w-full rounded-[32px] bg-[#f5f1ed]" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Skeleton className="h-12 w-64 rounded-full" />
        </div>
      </div>
    </div>
  );
}
