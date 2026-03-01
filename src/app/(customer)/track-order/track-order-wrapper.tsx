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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white shadow-sm ring-1 ring-[#e8dcc8] flex items-center justify-center">
            <Loader2 className="w-7 h-7 md:w-8 md:h-8 animate-spin text-[#c85a2d]" />
          </div>
        </div>
      }
    >
      <TrackOrderLogic />
    </Suspense>
  );
}
