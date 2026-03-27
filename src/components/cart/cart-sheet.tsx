"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, updateQuantity, removeItem, cartTotal, getItemKey, isLoaded } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja</SheetTitle>
        </SheetHeader>

        {!isLoaded ? (
          <div className="flex flex-1 flex-col gap-4 py-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3 animate-pulse">
                <div className="h-16 w-16 shrink-0 rounded-md border bg-muted/50" />
                <div className="flex flex-1 flex-col justify-between gap-2 py-1">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded-full bg-muted/50" />
                    <div className="h-3 w-1/3 rounded-full bg-muted/40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-muted/40" />
                    <div className="h-4 w-6 rounded-full bg-muted/40" />
                    <div className="h-7 w-7 rounded-md bg-muted/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
            <p>Keranjang kosong</p>
            <Button asChild variant="outline">
              <Link href="/products">Lihat Produk</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => {
                const key = getItemKey(item);
                const accessoriesTotal = (item.accessories || []).reduce(
                  (sum, accessory) => sum + accessory.price,
                  0,
                );
                const unitPrice = item.price + accessoriesTotal;

                return (
                <div key={key} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
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
                    <div>
                      <p className="text-sm font-medium leading-tight line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(unitPrice)}
                      </p>
                      {item.accessories && item.accessories.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {item.accessories
                            .map((accessory) => `${accessory.name}${accessory.selectedColor ? ` (${accessory.selectedColor})` : ""}`)
                            .join(", ")}
                        </p>
                      )}
                      <Link
                        href={{
                          pathname: `/products/${item.slug || "#"}`,
                          query: { item: item.cartLineId },
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c85a2d] hover:text-[#2d241c]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(key, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(key, item.quantity + 1)
                        }
                        disabled={
                          item.stock !== null && item.quantity >= item.stock
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => removeItem(key)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            <Separator />
            <SheetFooter className="flex-col gap-3 pt-4">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <Button asChild className="w-full">
                <Link href="/cart">Lihat Keranjang</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
