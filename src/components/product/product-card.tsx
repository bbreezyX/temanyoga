import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wand2, ImageOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-url";
import type { ProductListItem } from "@/types/api";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];
  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block relative perspective-1000"
    >
      <div className="relative rounded-[48px] bg-white p-4 shadow-soft ring-1 ring-[#e8dcc8]/40 transition-all duration-500 group-hover:shadow-lift group-hover:-translate-y-2 group-hover:ring-[#c85a2d]/20 h-full flex flex-col overflow-hidden">
        {/* Artistic Image Container with Organic Shape */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-[#f5f1ed] transition-all duration-700 group-hover:rounded-[var(--rounded-organic-1)]">
          {image ? (
            <Image
              src={getImageUrl(image.url)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
              <ImageOff className="w-10 h-10 opacity-30" />
            </div>
          )}

          {/* Glass Badge System */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md ring-1 ring-white/50 px-3 py-1.5 shadow-sm">
              <Wand2 className="w-[12px] h-[12px] text-[#c85a2d]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5a4a3b]">
                Handmade
              </span>
            </div>

            {outOfStock && (
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/90 text-white px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Closed
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Overlay (Mobile Minimalist) */}
          <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="h-12 w-12 rounded-full bg-slate-900 text-white grid place-items-center shadow-2xl">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="pt-6 pb-2 px-2 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-3 mb-4">
            <h3 className="font-display font-black text-[18px] md:text-[20px] text-slate-900 leading-[1.1] tracking-tight group-hover:text-[#c85a2d] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Investasi
              </span>
              <p className="text-[20px] md:text-[22px] font-display font-black text-[#c85a2d] leading-none">
                {formatCurrency(Number(product.price))}
              </p>
            </div>

            {!outOfStock ? (
              <div className="flex items-center gap-1.5 bg-[#7a9d7f]/10 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7a9d7f] animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7a9d7f]">
                  Ready
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                Restocking
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
