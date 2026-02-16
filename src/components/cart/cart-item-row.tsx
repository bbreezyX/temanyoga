"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import type { CartItem } from "@/types/api";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <article className="rounded-[30px] bg-white shadow-soft ring-1 ring-[#e8dcc8] p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="w-[74px] h-[74px] rounded-[22px] bg-[#f5f1ed] ring-1 ring-[#e8dcc8] grid place-items-center overflow-hidden relative">
            {item.image ? (
              <Image
                src={getImageUrl(item.image)}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <ShoppingBag className="w-5 h-5 text-[#5a4a3b]" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.slug || "#"}`}
                className="block group"
              >
                <p className="font-semibold text-[14px] text-slate-900 leading-5 group-hover:text-[#c85a2d] transition-colors">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[12px] text-[#7a6a58]">
                  Kualitas Premium • Pilihan Yoga
                </p>
              </Link>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="min-h-[44px] min-w-[44px] grid place-items-center rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] text-[#6b5b4b] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f1ed] ring-1 ring-[#e8dcc8] px-2.5 py-2">
              <button
                onClick={() =>
                  updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                }
                className="min-h-[44px] min-w-[44px] rounded-full bg-white ring-1 ring-[#e8dcc8] grid place-items-center text-[#5a4a3b] shadow-soft hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-[18px] h-[18px]" />
              </button>
              <span className="w-8 text-center text-[14px] font-semibold text-[#3f3328]">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-white ring-1 ring-[#e8dcc8] grid place-items-center text-[#5a4a3b] shadow-soft hover:bg-gray-50 transition-colors"
                disabled={item.stock !== null && item.quantity >= item.stock}
              >
                <Plus className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-[12px] font-semibold text-[#7a6a58]">
                {formatCurrency(item.price)}
              </p>
              <p className="mt-0.5 text-[14px] font-extrabold text-[#c85a2d]">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
