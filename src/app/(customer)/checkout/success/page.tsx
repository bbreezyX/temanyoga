"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function SuccessRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const email = searchParams.get("email");

  useEffect(() => {
    if (code) {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      router.replace(`/checkout/success/${code}${query}`);
    } else {
      router.replace("/products");
    }
  }, [code, email, router]);

  return (
    <div className="-mt-20 flex min-h-screen items-center justify-center bg-canvas-oat text-action md:-mt-24">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessRedirect />
    </Suspense>
  );
}
