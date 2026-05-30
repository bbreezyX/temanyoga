import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 text-[#2d241c] font-sans md:-mt-24 md:pt-24">
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 md:px-12">
        <section className="pt-10 md:pt-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="flex flex-col gap-7 lg:col-span-7">
              <div className="flex flex-col gap-6">
                <Skeleton className="h-5 w-40 rounded-full bg-[#dcd0bf]" />
                <div>
                  <Skeleton className="mb-3 h-4 w-24 rounded-full bg-[#dcd0bf]" />
                  <Skeleton className="h-10 w-80 max-w-full rounded-3xl bg-[#dcd0bf] md:h-12" />
                </div>
                <div className="flex items-start gap-2.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1">
                      <Skeleton className="h-2 w-full rounded-full bg-[#dcd0bf]" />
                      <Skeleton className="mt-2.5 h-4 w-16 rounded-full bg-[#dcd0bf]" />
                    </div>
                  ))}
                </div>
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-soft md:rounded-[40px] md:p-8"
                >
                  <div className="mb-6 flex items-start gap-3.5">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                    <div className="space-y-2 pt-0.5">
                      <Skeleton className="h-5 w-40 rounded-full" />
                      <Skeleton className="h-3.5 w-56 max-w-full rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full rounded-full" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Skeleton className="h-14 w-full rounded-full" />
                      <Skeleton className="h-14 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-soft md:rounded-[40px]">
                <div className="flex items-center justify-between px-4 pb-3 pt-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="space-y-4 px-4 pb-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-[68px] w-[68px] shrink-0 rounded-[18px] bg-[#f5f1ed]" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-4 w-2/3 rounded-full" />
                        <Skeleton className="h-4 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-4 rounded-[24px] border border-[#eadfce] bg-[#faf6f0] p-5 md:rounded-[32px]">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                  <div className="flex items-end justify-between border-t border-[#e8dcc8] pt-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-[58px] w-full rounded-full bg-[#dcd0bf]" />

              <div className="space-y-4 rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-soft">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 max-w-full rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
