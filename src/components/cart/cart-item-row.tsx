"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

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
    <article className="group flex flex-col md:flex-row items-start gap-6 py-8 border-b border-[#e8dcc8]/40 last:border-0 transition-all">
      <div className="shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] bg-[#f5f1ed] overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
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

      <div className="flex-1 w-full flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug || "#"}`}
              className="block group/link"
            >
              <h3 className="font-display font-black text-xl md:text-2xl text-[#2d241c] leading-tight group-hover/link:text-[#c85a2d] transition-colors">
                {item.name}
              </h3>
            </Link>
            {item.accessories && item.accessories.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.accessories.map((acc) => (
                  <span
                    key={acc.id}
                    className="inline-flex text-[11px] font-bold uppercase tracking-wider text-[#7a9d7f] bg-[#7a9d7f]/5 px-2 py-0.5 rounded-full ring-1 ring-[#7a9d7f]/20"
                  >
                    + {acc.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs font-medium text-[#9a8772] uppercase tracking-widest">
                Tanpa aksesoris
              </p>
            )}
          </div>

          <button
            onClick={() => removeItem(key)}
            className="p-2 rounded-full hover:bg-red-50 text-[#9a8772] hover:text-red-500 transition-all"
            aria-label="Hapus barang"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="inline-flex items-center rounded-2xl bg-[#f9f9f9] border border-[#e8dcc8]/60 p-1">
            <button
              onClick={() =>
                updateQuantity(key, Math.max(1, item.quantity - 1))
              }
              className="h-9 w-9 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-[15px] font-bold text-[#3f3328]">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(key, item.quantity + 1)}
              className="h-9 w-9 grid place-items-center rounded-xl hover:bg-white hover:shadow-sm text-[#3f3328] transition-all"
              disabled={item.stock !== null && item.quantity >= item.stock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-[13px] font-medium text-[#6b5b4b]">
              {formatCurrency(unitPrice)}{" "}
              <span className="text-[10px] opacity-50 font-normal">/ unit</span>
            </p>
            <p className="text-xl md:text-2xl font-black text-[#c85a2d] tracking-tight">
              {formatCurrency(unitPrice * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
