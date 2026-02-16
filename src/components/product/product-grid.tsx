import { ProductCard } from "./product-card";
import type { ProductListItem } from "@/types/api";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Belum ada produk.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`
            ${index % 5 === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
            ${index % 7 === 0 ? "md:rotate-1 hover:rotate-0" : ""}
            transition-transform duration-500
          `}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
