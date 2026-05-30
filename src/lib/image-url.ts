import { EMAIL_DOMAIN, LEGACY_EMAIL_DOMAIN } from "@/lib/email-config";
import { SITE_URL } from "@/lib/site-url";

const STORAGE_PREFIXES = [
  "products/",
  "payment-proofs/",
  "accessories/",
] as const;

const PROXY_PREFIX = "/api/r2/";

/** Extract R2 object key from proxy paths, bare keys, or any absolute storage URL. */
export function extractStorageKey(url: string): string | null {
  if (!url) return null;

  if (url.startsWith(PROXY_PREFIX)) {
    return url.slice(PROXY_PREFIX.length);
  }

  if (STORAGE_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return url;
  }

  try {
    const key = new URL(url).pathname.replace(/^\//, "");
    if (STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      return key;
    }
  } catch {
    // Not an absolute URL — fall through.
  }

  return null;
}

function buildStorageUrl(key: string): string {
  return `${PROXY_PREFIX}${key}`;
}

/**
 * Same-origin URL for stored assets. Rewrites legacy domains and R2 CDN URLs
 * to /api/r2/* so the browser never hits pub-*.r2.dev directly (often blocked
 * or times out from customer networks).
 */
export function getImageUrl(url: string): string {
  const key = extractStorageKey(url);
  if (key) {
    return buildStorageUrl(key);
  }

  if (url.includes(LEGACY_EMAIL_DOMAIN)) {
    return url.replaceAll(LEGACY_EMAIL_DOMAIN, EMAIL_DOMAIN);
  }

  return url;
}

/** Absolute URL for JSON-LD, OG generation, and external consumers. */
export function getAbsoluteImageUrl(url: string): string {
  const resolved = getImageUrl(url);
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    return resolved;
  }
  return `${SITE_URL}${resolved}`;
}
