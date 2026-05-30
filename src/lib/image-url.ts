import { EMAIL_DOMAIN, LEGACY_EMAIL_DOMAIN } from "./email-config";
import { SITE_URL } from "./site-url";
const STORAGE_PREFIXES = [
  "products/",
  "payment-proofs/",
  "accessories/",
] as const;

const PROXY_PREFIX = "/api/r2/";

const LEGACY_R2_HOST = "pub-38c629e713a54e8e9ed0a762c8f2666d.r2.dev";

/** Custom R2 domain — kept in remotePatterns even if env is unset at build time. */
export const R2_CDN_HOSTNAME = "cdn.temaniyoga.com";

/** Public CDN base (e.g. https://cdn.temaniyoga.com). Must be NEXT_PUBLIC_* for client. */
function getCdnBase(): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  return base || null;
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
    const parsed = new URL(url);
    const key = parsed.pathname.replace(/^\//, "");
    if (STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      return key;
    }
  } catch {
    // Not an absolute URL — fall through.
  }

  return null;
}

/** Product/accessory assets served from CDN; payment proofs stay private. */
export function isPublicStorageAsset(url: string): boolean {
  const key = extractStorageKey(url);
  if (!key) return false;
  return !key.startsWith("payment-proofs/");
}

function buildProxyUrl(key: string): string {
  return `${PROXY_PREFIX}${key}`;
}

function buildCdnUrl(key: string): string {
  const cdn = getCdnBase();
  if (cdn) return `${cdn}/${key}`;
  return buildProxyUrl(key);
}

/**
 * URLs for next/image and UI.
 * - products/ & accessories/ → CDN (browser loads directly; use unoptimized on Image)
 * - payment-proofs/ → same-origin proxy (admin-only)
 */
export function getImageUrl(url: string): string {
  const key = extractStorageKey(url);
  if (key) {
    if (key.startsWith("payment-proofs/")) {
      return buildProxyUrl(key);
    }
    return buildCdnUrl(key);
  }

  if (url.includes(LEGACY_EMAIL_DOMAIN)) {
    return url.replaceAll(LEGACY_EMAIL_DOMAIN, EMAIL_DOMAIN);
  }

  return url;
}

/** Absolute URL for JSON-LD, OG, and email templates. */
export function getAbsoluteImageUrl(url: string): string {
  const key = extractStorageKey(url);
  if (key) {
    if (key.startsWith("payment-proofs/")) {
      return `${SITE_URL}${buildProxyUrl(key)}`;
    }
    return buildCdnUrl(key);
  }

  const resolved = getImageUrl(url);
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    return resolved;
  }
  return `${SITE_URL}${resolved}`;
}

/** Hostnames allowed in next.config images.remotePatterns (CDN + legacy DB URLs). */
export function getStorageImageHostnames(): string[] {
  const hostnames = new Set<string>([LEGACY_R2_HOST, R2_CDN_HOSTNAME]);

  const cdn = getCdnBase();
  if (cdn) {
    try {
      hostnames.add(new URL(cdn).hostname);
    } catch {
      // ignore invalid env
    }
  }

  return [...hostnames];
}
