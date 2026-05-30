"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Client-only + code-split: the canvas/WASM player must not render on the server.
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false },
);

// 👉 To enable the animated character: drop a Lottie file in /public (e.g.
//    public/lottie/hero-yoga.json or .lottie) and set LOTTIE_SRC to its path.
//    While null, the photo-card fallback is shown and nothing is fetched.
const LOTTIE_SRC: string | null = null; // e.g. "/lottie/hero-yoga.json"

export function HeroAnimation({ fallback }: { fallback: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // No asset configured (or it failed to load) → keep the polished photo card.
  if (!LOTTIE_SRC || failed) return <>{fallback}</>;

  return (
    <div className="relative mx-auto w-full max-w-sm md:max-w-none">
      {!ready && fallback}
      <div
        aria-hidden={!ready}
        className={
          ready
            ? "relative mx-auto aspect-[4/5] w-full"
            : "pointer-events-none absolute inset-0 opacity-0"
        }
      >
        <DotLottieReact
          src={LOTTIE_SRC}
          autoplay
          loop
          speed={0.85}
          className="h-full w-full"
          dotLottieRefCallback={(dot) => {
            if (!dot) return;
            dot.addEventListener("load", () => setReady(true));
            dot.addEventListener("loadError", () => setFailed(true));
          }}
        />
      </div>
    </div>
  );
}
