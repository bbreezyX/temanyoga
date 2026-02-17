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
    <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center text-[#c85a2d]">
      <Loader2 className="w-10 h-10 animate-spin" />
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
