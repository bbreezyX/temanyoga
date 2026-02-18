import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen overflow-hidden">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[90vh] flex flex-col pt-20 pb-12 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center flex-1">
          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10">
            <div className="inline-flex items-center gap-3 mb-8">
              <Skeleton className="w-12 h-[1px] bg-[#c85a2d]" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="space-y-4 mb-12">
              <Skeleton className="h-[12vw] lg:h-[140px] w-3/4 rounded-xl" />
              <Skeleton className="h-[12vw] lg:h-[140px] w-1/2 rounded-xl" />
            </div>

            <div className="ml-8 border-l border-[#c85a2d]/30 pl-6">
              <Skeleton className="h-6 w-full max-w-lg mb-2" />
              <Skeleton className="h-6 w-3/4 max-w-lg mb-2" />
              <Skeleton className="h-6 w-5/6 max-w-lg" />
            </div>

            <div className="mt-16 flex items-center gap-8">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 relative h-[50vh] lg:h-[80vh] w-full items-center justify-center flex">
            <div className="relative w-full h-full">
              <Skeleton className="absolute top-[10%] right-0 w-[90%] h-[80%] rounded-[40px] md:rounded-[80px] bg-[#f5f1ed]" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Skeleton */}
      <div className="w-full h-16 bg-[#3f3328] opacity-80" />

      {/* Products Section Skeleton */}
      <section className="py-24 md:py-32 bg-white">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-20 w-64 md:w-96 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`relative ${i % 2 !== 0 ? "md:translate-y-12" : ""}`}
              >
                <Skeleton className="aspect-[3/4] w-full rounded-[32px] mb-6 bg-[#f5f1ed]" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section Skeleton */}
      <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <Skeleton className="h-20 w-full mb-8 rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>

          <div className="lg:col-span-8 space-y-32">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-8 md:gap-16 border-t border-[#e8dcc8] pt-8"
              >
                <Skeleton className="h-6 w-32 shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-12 w-3/4 mb-6 rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
