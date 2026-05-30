import { getImageUrl } from "@/lib/image-url";

/** Lightweight CDN thumbnail for admin grids (no next/image optimizer hop). */
export function AdminProductThumbnail({
  storageUrl,
  alt,
}: {
  storageUrl: string;
  alt: string;
}) {
  return (
    <img
      src={getImageUrl(storageUrl)}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
