import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] md:-mt-24 md:pt-24">
      <div className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-12 pb-24">
        {/* Breadcrumb */}
        <section className="pt-8 md:pt-12">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16 rounded-full bg-[#dcd0bf]" />
            <Skeleton className="h-1 w-1 rounded-full bg-[#dcd0bf]" />
            <Skeleton className="h-5 w-16 rounded-full bg-[#dcd0bf]" />
            <Skeleton className="h-1 w-1 rounded-full bg-[#dcd0bf]" />
            <Skeleton className="h-5 w-32 rounded-full bg-[#dcd0bf]" />
          </div>
        </section>

        {/* Main grid */}
        <section className="pt-8 md:pt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-32 self-start">
            <Skeleton className="aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-[40px] bg-[#f5f1ed]" />
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-16 sm:h-24 sm:w-20 md:h-28 md:w-24 shrink-0 rounded-[20px] bg-[#f5f1ed]"
                />
              ))}
            </div>
          </div>

          {/* Purchase panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Title + price */}
            <div>
              <Skeleton className="h-5 w-40 rounded-full bg-[#dcd0bf] mb-4" />
              <Skeleton className="h-12 md:h-16 w-full rounded-3xl bg-[#dcd0bf] mb-4" />
              <Skeleton className="h-9 w-48 rounded-full bg-[#dcd0bf]" />
            </div>
            {/* Description */}
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-full rounded-full bg-[#dcd0bf]" />
              <Skeleton className="h-5 w-full rounded-full bg-[#dcd0bf]" />
              <Skeleton className="h-5 w-3/4 rounded-full bg-[#dcd0bf]" />
            </div>
            {/* Buy box */}
            <div className="rounded-[32px] border border-[#eadfce] bg-white shadow-soft p-6 md:p-7 space-y-7">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-14 w-36 rounded-2xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-2xl bg-[#dcd0bf]" />
              <Skeleton className="h-20 rounded-2xl bg-[#dcd0bf]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
