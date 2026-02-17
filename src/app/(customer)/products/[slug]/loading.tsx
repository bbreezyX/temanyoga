import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="bg-[#f5f1ed] min-h-screen">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
        <section className="pt-6 md:pt-8">
          <div className="flex items-center gap-2 md:gap-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </section>
        <section className="pt-6 md:pt-10 grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24 self-start">
            <Skeleton className="aspect-square rounded-[32px] md:rounded-[40px]" />
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 rounded-2xl md:rounded-3xl" />
              ))}
            </div>
          </div>
          <div className="flex flex-col py-0 lg:py-2">
            <div className="mb-6 md:mb-8">
              <Skeleton className="h-8 w-32 rounded-full mb-4" />
              <Skeleton className="h-10 md:h-14 w-full mb-4" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="mb-8 md:mb-10">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex justify-center sm:justify-start">
                  <Skeleton className="h-14 w-36 rounded-full" />
                </div>
                <Skeleton className="h-14 w-full sm:flex-1 rounded-full" />
              </div>
              <div className="pt-6 md:pt-8 grid grid-cols-2 gap-3 md:gap-4 border-t border-[#e8dcc8]">
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}