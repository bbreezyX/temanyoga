/**
 * Returns the original R2 public URL directly.
 * Images are served via Cloudflare's CDN and optimized by next/image
 * (remotePatterns is configured in next.config.ts).
 */
export function getImageUrl(url: string): string {
  return url;
}
