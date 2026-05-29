"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrackOrderContent from "./track-order-content";
import { Loader2 } from "lucide-react";

function TrackOrderLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromQuery = searchParams.get("code") ?? "";

  useEffect(() => {
    if (codeFromQuery) {
      router.replace(`/track-order/${codeFromQuery}`);
    }
  }, [codeFromQuery, router]);

  return <TrackOrderContent />;
}

export function TrackOrderWrapper() {
  return (
    <Suspense
      fallback={
        <div className="-mt-20 flex min-h-screen items-center justify-center bg-canvas-oat md:-mt-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper shadow-sm ring-1 ring-black/5 md:h-16 md:w-16 md:rounded-3xl">
            <Loader2 className="h-7 w-7 animate-spin text-action md:h-8 md:w-8" />
          </div>
        </div>
      }
    >
      <TrackOrderLogic />
    </Suspense>
  );
}
