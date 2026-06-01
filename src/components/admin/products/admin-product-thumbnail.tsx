import Image from "next/image";
import { getImageUrl } from "@/lib/image-url";

const ADMIN_THUMBNAIL_SIZES = {
  list: "80px",
  grid: "(max-width: 399px) 100vw, (max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1279px) 25vw, 20vw",
  dialog: "120px",
} as const;

export type AdminProductThumbnailSize = keyof typeof ADMIN_THUMBNAIL_SIZES;

/** Admin list/grid thumbnails via Next.js image optimizer (not full CDN assets). */
export function AdminProductThumbnail({
  storageUrl,
  alt,
  size = "grid",
}: {
  storageUrl: string;
  alt: string;
  size?: AdminProductThumbnailSize;
}) {
  return (
    <Image
      src={getImageUrl(storageUrl)}
      alt={alt}
      fill
      sizes={ADMIN_THUMBNAIL_SIZES[size]}
      quality={60}
      loading="lazy"
      placeholder="empty"
      className="object-cover bg-warm-sand/40"
    />
  );
}
