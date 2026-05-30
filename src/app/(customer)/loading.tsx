import { Skeleton } from "@/components/ui/skeleton";

/** Lightweight fallback for customer route transitions (non-home routes). */
export default function CustomerLoading() {
  return (
    <div className="-mt-20 min-h-[50vh] bg-canvas-oat pt-20 md:-mt-24 md:pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 sm:px-8 md:py-24">
        <Skeleton className="h-8 w-48 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-[24px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
