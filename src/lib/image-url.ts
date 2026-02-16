const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getImageUrl(url: string): string {
  if (!R2_PUBLIC_URL || !url.includes(".r2.dev/")) {
    return url;
  }

  const key = url.split(".r2.dev/")[1];
  return `/api/r2/${key}`;
}
