import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="-mt-20 min-h-screen overflow-hidden bg-canvas-oat pt-20 md:-mt-24 md:pt-24">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-5 pt-10 pb-16 text-center sm:px-8 sm:pt-14 md:pb-24">
        <Skeleton className="h-9 w-56 rounded-full" />

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <Skeleton className="h-12 w-72 rounded-2xl sm:h-20 sm:w-[26rem] md:h-28 md:w-[34rem]" />
          <Skeleton className="h-12 w-56 rounded-2xl sm:h-20 sm:w-80 md:h-28 md:w-[26rem]" />
        </div>

        <div className="mt-7 flex w-full max-w-xl flex-col items-center gap-2">
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-2/3 rounded-full" />
        </div>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Skeleton className="h-12 w-48 rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>

        {/* Hero image card */}
        <Skeleton className="mt-16 aspect-[16/10] w-full max-w-4xl rounded-[40px] sm:aspect-[16/9] md:mt-20" />
      </section>

      {/* Trust marquee */}
      <div className="flex items-center gap-8 overflow-hidden border-y border-black/5 bg-paper px-5 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-40 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-2xl sm:w-80" />
          </div>
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[32px] border border-black/5 bg-paper p-4"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-[24px]" />
              <div className="flex flex-col items-center gap-2 px-2 pt-4">
                <Skeleton className="h-4 w-2/3 rounded-full" />
                <Skeleton className="h-6 w-1/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Artisan story cards */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 md:py-16">
        <div className="mx-auto mb-12 flex max-w-md flex-col items-center gap-4">
          <Skeleton className="h-9 w-40 rounded-full" />
          <Skeleton className="h-12 w-72 rounded-2xl" />
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-6 rounded-[40px] border border-black/5 bg-paper p-6 md:grid-cols-2 md:gap-10 md:p-10"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-[28px]" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
