"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "./image-gallery";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import type { ProductDetail as ProductDetailType } from "@/types/api";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const outOfStock = product.stock !== null && product.stock <= 0;
  const maxQty = product.stock ?? 99;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity,
      stock: product.stock,
      image: product.images[0]?.url ?? null,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
    setQuantity(1);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <ImageGallery images={product.images} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {outOfStock ? (
            <Badge variant="destructive">Stok Habis</Badge>
          ) : product.stock !== null ? (
            <Badge variant="secondary">Stok: {product.stock}</Badge>
          ) : (
            <Badge variant="secondary">Tersedia</Badge>
          )}
        </div>

        {!outOfStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Jumlah:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={outOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>

        <div className="prose prose-sm max-w-none">
          <h3 className="text-lg font-semibold">Deskripsi</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
