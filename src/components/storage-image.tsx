import Image, { type ImageProps } from "next/image";
import { getImageUrl, isPublicStorageAsset } from "@/lib/image-url";

type StorageImageProps = Omit<ImageProps, "src"> & {
  /** Value from DB: key, proxy path, CDN URL, or legacy r2.dev URL */
  storageUrl: string;
};

/**
 * next/image for R2 assets: public catalog images use CDN + unoptimized;
 * payment proofs use /api/r2 proxy (optimizer-safe, same-origin).
 */
export function StorageImage({ storageUrl, ...props }: StorageImageProps) {
  return (
    <Image
      src={getImageUrl(storageUrl)}
      unoptimized={isPublicStorageAsset(storageUrl)}
      {...props}
    />
  );
}
