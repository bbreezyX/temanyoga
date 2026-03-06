const DEFAULT_SITE_URL = "https://www.ditemaniyoga.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT_SITE_URL;