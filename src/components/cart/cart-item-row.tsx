"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import type { CartItem } from "@/types/api";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, getItemKey } = useCart();
  const key = getItemKey(item);
  const accTotal = (item.accessories || []).reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + accTotal;

  return (
    <article className="group rounded-[32px] border border-[#e8dcc8]/70 bg-white shadow-soft p-5 md:p-6 mb-5 last:mb-0 transition-all hover:border-[#c85a2d]/30">
      <div className="flex gap-5">
        <div className="shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-[24px] bg-[#f5f1ed] overflow-hidden relative grid place-items-center group-hover:scale-[1.02] transition-transform duration-500">
            {item.image ? (
              <Image
                src={getImageUrl(item.image)}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <ShoppingBag className="w-6 h-6 text-[#c85a2d]/40" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.slug || "#"}`}
                className="block group/link"
              >
                <h3 className="font-display font-black text-lg md:text-xl text-[#2d241c] leading-tight group-hover/link:text-[#c85a2d] transition-colors">
                  {item.name}
                </h3>
              </Link>
              {item.accessories && item.accessories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.accessories.map((acc) => (
                    <span
                      key={`${acc.id}-${acc.selectedColor ?? "default"}`}
                      className="inline-flex text-[11px] font-bold uppercase tracking-wider text-[#7a9d7f] bg-[#7a9d7f]/5 px-2 py-0.5 rounded-full ring-1 ring-[#7a9d7f]/20"
                    >
                      + {acc.name}
                      {acc.selectedColor ? ` (${acc.selectedColor})` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[11px] font-medium text-[#9a8772] uppercase tracking-widest">
                  Tanpa aksesoris
                </p>
              )}
              <Link
                href={{
                  pathname: `/products/${item.slug || "#"}`,
                  query: { item: item.cartLineId },
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#c85a2d] hover:text-[#2d241c] transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Item
              </Link>
            </div>

            <button
              onClick={() => removeItem(key)}
              className="p-2 rounded-full hover:bg-red-50 text-[#9a8772] hover:text-red-500 transition-all shrink-0"
              aria-label="Hapus barang"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8] p-1">
              <button
                onClick={() => updateQuantity(key, Math.max(1, item.quantity - 1))}
                className="h-9 w-9 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all"
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-[15px] font-bold text-[#3f3328]">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(key, item.quantity + 1)}
                className="h-9 w-9 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all disabled:opacity-30"
                disabled={item.stock !== null && item.quantity >= item.stock}
                aria-label="Tambah jumlah"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-[12px] font-medium text-[#6b5b4b]">
                {formatCurrency(unitPrice)}{" "}
                <span className="text-[10px] opacity-50 font-normal">/ unit</span>
              </p>
              <p className="text-xl md:text-2xl font-black text-[#c85a2d] tracking-tight">
                {formatCurrency(unitPrice * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
