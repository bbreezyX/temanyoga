import { Skeleton } from "@/components/ui/skeleton";

export default function TrackOrderLoading() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 md:-mt-24 md:pt-24">
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:px-8 sm:pt-14 md:pt-16 md:pb-16">
        <div className="flex justify-center">
          <Skeleton className="h-9 w-56 rounded-full" />
        </div>

        <div className="mt-6 flex justify-center">
          <Skeleton className="h-12 w-72 rounded-2xl sm:h-20 sm:w-[26rem]" />
        </div>

        <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-2">
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-2/3 rounded-full" />
        </div>

        <Skeleton className="mt-8 h-16 w-full rounded-full sm:mt-10 sm:h-20" />
      </section>
    </div>
  );
}
