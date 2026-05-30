import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import type { ProductListItem } from "@/types/api";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductListItem;
  priority?: boolean;
}) {
  const image = product.images[0];
  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col rounded-[24px] border border-black/5 bg-paper p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(32,32,32,0.3)] sm:rounded-[32px] sm:p-4"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-canvas-oat sm:rounded-[24px]">
        {image ? (
          <Image
            src={getImageUrl(image.url)}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              outOfStock ? "opacity-70" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/20">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
          {outOfStock ? (
            <span className="inline-flex items-center rounded-full bg-paper px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500 shadow-sm">
              Sold Out
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-paper/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-action shadow-sm backdrop-blur-sm">
              Handmade
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-1 pt-4 pb-1 text-center">
        <h3 className="line-clamp-1 w-full text-sm font-semibold text-ink transition-colors group-hover:text-action sm:text-base">
          {product.name}
        </h3>
        <span className="mt-2 inline-block rounded-full bg-canvas-oat px-3 py-1 text-xs font-semibold text-ink sm:text-sm">
          {formatCurrency(Number(product.price))}
        </span>
      </div>
    </Link>
  );
}
