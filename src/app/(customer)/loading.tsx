import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-[#f5f1ed] min-h-screen">
      <section className="relative pt-6 pb-6 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="relative min-h-[70svh] md:min-h-[75svh] lg:min-h-[80svh] flex flex-col items-start justify-center py-12 md:py-20 px-6 md:px-16 rounded-[40px] md:rounded-[64px] bg-white overflow-hidden shadow-soft ring-1 ring-[#e8dcc8]/50">
          <Skeleton className="h-8 w-48 rounded-full mb-8" />
          <Skeleton className="h-16 md:h-24 w-full max-w-2xl mb-6" />
          <Skeleton className="h-6 w-full max-w-xl mb-4" />
          <Skeleton className="h-6 w-3/4 max-w-lg mb-12" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-40 rounded-full" />
            <Skeleton className="h-14 w-36 rounded-full" />
          </div>
        </div>
      </section>
      <section className="pt-24 md:pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 md:h-16 w-64 mb-20" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 rounded-[48px] bg-white p-10 ring-1 ring-[#e8dcc8]/50">
            <Skeleton className="h-16 w-16 rounded-2xl mb-8" />
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="md:col-span-7 rounded-[48px] bg-white p-10 ring-1 ring-[#e8dcc8]/50">
            <Skeleton className="h-16 w-16 rounded-2xl mb-8" />
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}