const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL ?? "";

export function getR2Origin(): string | null {
  if (!R2_PUBLIC_URL) return null;

  try {
    return new URL(R2_PUBLIC_URL).origin;
  } catch {
    return null;
  }
}

/**
 * Returns the CDN URL for stored assets. Product images are served directly
 * from R2 (no /_next/image hop). In development, falls back to /api/r2 proxy.
 */
export function getImageUrl(url: string): string {
  if (
    process.env.NODE_ENV !== "production" &&
    R2_PUBLIC_URL &&
    url.startsWith(R2_PUBLIC_URL)
  ) {
    const key = url.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
    return `/api/r2/${key}`;
  }
  return url;
}
