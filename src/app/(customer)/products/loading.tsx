import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 pb-24 md:-mt-24 md:pt-24">
      <div className="mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:px-8 sm:pt-14 md:pt-16 md:pb-16">
        <Skeleton className="mx-auto h-7 w-44 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-16 w-3/4 rounded-3xl" />
        <Skeleton className="mx-auto mt-5 h-5 w-2/3 rounded-full" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-48 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[24px] border border-black/5 bg-paper p-3 sm:rounded-[32px] sm:p-4"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-[18px] sm:rounded-[24px]" />
              <div className="flex flex-col items-center gap-2 pt-4">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-6 w-1/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
