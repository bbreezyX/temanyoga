import { ProductCard } from "./product-card";
import { Sparkles } from "lucide-react";
import type { ProductListItem } from "@/types/api";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[32px] border border-black/5 bg-paper px-8 py-16 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-action/40" />
        <p className="mt-4 text-base font-medium text-ink-soft">
          Belum ada produk untuk ditampilkan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
