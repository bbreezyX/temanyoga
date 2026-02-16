"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import type { CartItem } from "@/types/api";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
        {item.image ? (
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
            No img
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <Link
            href={`/products/${item.slug}`}
            className="font-medium hover:underline line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="font-semibold shrink-0 ml-4">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.stock !== null && item.quantity >= item.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="text-sm text-muted-foreground ml-1">
              x {formatCurrency(item.price)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
