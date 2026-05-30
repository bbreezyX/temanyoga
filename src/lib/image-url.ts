import { EMAIL_DOMAIN, LEGACY_EMAIL_DOMAIN } from "@/lib/email-config";

const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL ?? "";

const STORAGE_PREFIXES = [
  "products/",
  "payment-proofs/",
  "accessories/",
] as const;

const PROXY_PREFIX = "/api/r2/";

export function getR2Origin(): string | null {
  if (!R2_PUBLIC_URL) return null;

  try {
    return new URL(R2_PUBLIC_URL).origin;
  } catch {
    return null;
  }
}

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
  if (process.env.NODE_ENV !== "production") {
    return `${PROXY_PREFIX}${key}`;
  }

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }

  return `${PROXY_PREFIX}${key}`;
}

/**
 * Returns the CDN URL for stored assets. Normalizes legacy domain URLs
 * (e.g. ditemaniyoga.com) to the current R2 public URL. In development,
 * falls back to the /api/r2 proxy.
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
