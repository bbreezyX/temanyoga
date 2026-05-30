"use client";

import Link from "next/link";
import { StorageImage } from "@/components/storage-image";
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/api";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, getItemKey } = useCart();
  const key = getItemKey(item);
  const accTotal = (item.accessories || []).reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + accTotal;

  return (
    <article className="group mb-5 rounded-[28px] border border-[#eadfce] bg-white p-5 shadow-soft transition-colors last:mb-0 hover:border-[#c85a2d]/30 md:rounded-[32px] md:p-6">
      {/* Top — thumbnail, title, edit & remove */}
      <div className="flex gap-5">
        <div className="shrink-0">
          <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-[20px] bg-[#f5f1ed] transition-transform duration-500 group-hover:scale-[1.02] md:h-28 md:w-28">
            {item.image ? (
              <StorageImage
                storageUrl={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 96px, 112px"
                className="object-cover"
              />
            ) : (
              <ShoppingBag className="h-6 w-6 text-[#c85a2d]/40" />
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug || "#"}`}
              className="group/link block"
            >
              <h3 className="font-sans text-lg font-bold leading-tight text-[#2d241c] transition-colors group-hover/link:text-[#c85a2d] md:text-xl">
                {item.name}
              </h3>
            </Link>
            <Link
              href={{
                pathname: `/products/${item.slug || "#"}`,
                query: { item: item.cartLineId },
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#c85a2d] transition-colors hover:text-[#2d241c]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit item
            </Link>
          </div>

          <button
            onClick={() => removeItem(key)}
            className="shrink-0 rounded-full p-2 text-[#9a8772] transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Hapus barang"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Accessories — full width so each pill stays on one line */}
      {item.accessories && item.accessories.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.accessories.map((acc) => (
            <span
              key={`${acc.id}-${acc.selectedColor ?? "default"}`}
              className="inline-flex items-center whitespace-nowrap rounded-full border border-[#7a9d7f]/20 bg-[#7a9d7f]/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#5a8d5f]"
            >
              + {acc.name}
              {acc.selectedColor ? ` (${acc.selectedColor})` : ""}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[12px] font-medium text-[#9a8772]">
          Tanpa aksesoris
        </p>
      )}

      {/* Footer — quantity stepper & line total */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#eadfce] pt-5">
        <div className="inline-flex items-center rounded-full border border-[#e8dcc8] bg-[#faf6f0] p-1">
          <button
            onClick={() => updateQuantity(key, Math.max(1, item.quantity - 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-[#3f3328] transition-all hover:bg-white hover:shadow-sm"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-[15px] font-bold text-[#3f3328]">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(key, item.quantity + 1)}
            className="grid h-9 w-9 place-items-center rounded-full text-[#3f3328] transition-all hover:bg-white hover:shadow-sm disabled:opacity-30"
            disabled={item.stock !== null && item.quantity >= item.stock}
            aria-label="Tambah jumlah"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[12px] font-medium text-[#6b5b4b]">
            {formatCurrency(unitPrice)}{" "}
            <span className="text-[10px] font-normal opacity-50">/ unit</span>
          </p>
          <p className="text-xl font-extrabold tracking-tight text-[#c85a2d] md:text-2xl">
            {formatCurrency(unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </article>
  );
}
