const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL ?? "";

/**
 * In production, returns the R2 CDN URL directly (optimized by next/image).
 * In development, rewrites to the local proxy /api/r2/[key] so images work
 * without needing the R2 bucket to be publicly accessible.
 */
export function getImageUrl(url: string): string {
  if (process.env.NODE_ENV !== "production" && R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    const key = url.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
    return `/api/r2/${key}`;
  }
  return url;
}
