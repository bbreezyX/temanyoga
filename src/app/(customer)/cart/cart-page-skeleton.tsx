import { Skeleton } from "@/components/ui/skeleton";

export function CartPageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div
      className={
        showHeader
          ? "-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24"
          : undefined
      }
    >
      <div className={showHeader ? "mx-auto w-full max-w-7xl flex-1 px-5 pb-24 md:px-12" : undefined}>
        <section className={showHeader ? "pt-12 md:pt-16" : undefined}>
          {showHeader ? (
            <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <Skeleton className="mb-4 h-4 w-28 rounded-full bg-[#dcd0bf]" />
                <Skeleton className="h-12 w-72 max-w-full rounded-3xl bg-[#dcd0bf] md:h-16" />
              </div>
              <Skeleton className="h-5 w-44 rounded-full bg-[#dcd0bf]" />
            </div>
          ) : null}

          <div className="items-start lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="mb-12 flex flex-col gap-5 lg:col-span-7 lg:mb-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] border border-[#eadfce] bg-white p-5 shadow-soft md:rounded-[32px] md:p-6"
                >
                  <div className="flex gap-5">
                    <Skeleton className="h-24 w-24 shrink-0 rounded-[20px] bg-[#f5f1ed] md:h-28 md:w-28" />
                    <div className="min-w-0 flex-1 space-y-3 pt-1">
                      <Skeleton className="h-5 w-2/3 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#eadfce] pt-5">
                    <Skeleton className="h-11 w-32 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-soft md:rounded-[40px]">
                <div className="flex items-center justify-between px-4 pb-3 pt-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="space-y-4 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-5 md:rounded-[32px]">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e8dcc8] pt-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-7 w-28 rounded-full" />
                  </div>
                </div>
                <div className="px-1 pb-1 pt-3">
                  <Skeleton className="h-[58px] w-full rounded-full bg-[#dcd0bf]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
