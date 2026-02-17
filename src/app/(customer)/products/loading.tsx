import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 pb-24">
      <div className="mt-16 md:mt-24 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12 md:mb-16">
          <div className="flex flex-col">
            <Skeleton className="h-10 md:h-12 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Skeleton className="h-12 w-24 rounded-full" />
            <Skeleton className="h-12 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full flex flex-col">
              <div className="relative rounded-[48px] bg-white p-4 shadow-soft ring-1 ring-[#e8dcc8]/40 h-full flex flex-col">
                <Skeleton className="aspect-[4/5] rounded-[32px] bg-[#f5f1ed]" />
                <div className="pt-6 pb-2 px-2 flex flex-col flex-1">
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="flex-1" />
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-7 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
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