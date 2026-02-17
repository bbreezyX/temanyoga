import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 ring-1 ring-border">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>

        <div className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 ring-1 ring-border">
              <div>
                <Skeleton className="h-5 w-28 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-11 w-full md:w-48 rounded-full mt-6" />
        </div>
      </div>
    </div>
  );
}