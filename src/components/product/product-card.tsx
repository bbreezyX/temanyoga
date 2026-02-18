import Link from "next/link";
import Image from "next/image";
import { ImageOff, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import type { ProductListItem } from "@/types/api";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];
  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block relative">
      <div className="flex flex-col gap-5">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[40px] bg-[#f9f9f9] border border-[#e8dcc8]/40 isolate">
          {image ? (
            <Image
              src={getImageUrl(image.url)}
              alt={product.name}
              fill
              className="object-cover transition-all duration-1000 group-hover:scale-105 group-hover:rotate-1"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[#9a8772]">
              <ImageOff className="w-12 h-12 opacity-20" />
            </div>
          )}

          {/* Premium Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            {outOfStock && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-red-100 shadow-lift-sm text-red-500">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Sent Out
                </span>
              </div>
            )}
            {!outOfStock && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-[#e8dcc8]/60 shadow-lift-sm text-[#c85a2d] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Handmade
                </span>
              </div>
            )}
          </div>

          {/* Simple Link Icon */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-x-4 group-hover:translate-x-0">
            <div className="w-12 h-12 rounded-full bg-[#2d241c] text-white flex items-center justify-center shadow-lift-md">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-2 items-center text-center">
          <h3 className="font-display text-2xl font-black leading-tight text-[#2d241c] group-hover:text-[#c85a2d] transition-colors line-clamp-1 uppercase tracking-tight">
            {product.name}
          </h3>
          <p className="text-[#6b5b4b] font-bold font-sans uppercase tracking-[0.2em] text-[13px]">
            {formatCurrency(Number(product.price))}
          </p>
        </div>
      </div>
    </Link>
  );
}
