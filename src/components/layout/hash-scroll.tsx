"use client";

import { useEffect } from "react";

/**
 * Scrolls to the element matching the current URL hash on mount and on
 * hashchange. Next.js App Router does not reliably scroll to a hash target on
 * cross-page navigation (e.g. /products → /#story), so this bridges that gap.
 * Lands below the sticky header via the target's `scroll-mt-*`.
 */
export function HashScroll() {
  useEffect(() => {
    function scrollToHash() {
      const { hash } = window.location;
      if (hash.length < 2) return;
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
