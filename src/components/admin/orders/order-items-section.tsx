"use client";

import { useMemo } from "react";
import { Package2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";

type OrderItem = {
  id: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  accessoriesTotal: number | null;
  accessoriesSnapshot: string | null;
  product: {
    slug: string;
    images: { url: string }[];
  };
};

type OrderItemsSectionProps = {
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number | null;
  shippingCost: number | null;
  couponCode: string | null;
  shippingZoneName: string | null;
};

export function OrderItemsSection({
  items,
  totalAmount,
  discountAmount,
  shippingCost,
  couponCode,
  shippingZoneName,
}: OrderItemsSectionProps) {
  const parsedAccessories = useMemo(() => {
    const map = new Map<string, { name: string; price: number }[]>();
    for (const item of items) {
      if (item.accessoriesSnapshot) {
        try {
          map.set(item.id, JSON.parse(item.accessoriesSnapshot));
        } catch {
          map.set(item.id, []);
        }
      } else {
        map.set(item.id, []);
      }
    }
    return map;
  }, [items]);

  const productSubtotal = totalAmount + (discountAmount ?? 0) - (shippingCost ?? 0);

  return (
    <section className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg sm:text-xl font-extrabold text-dark-brown flex items-center gap-2">
          <Package2 className="text-sage h-5 w-5 sm:h-6 sm:w-6" />
          Ringkasan Item
        </h2>
        <span className="text-sm font-bold text-warm-gray">
          {items.length} Item
        </span>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {items.map((item) => {
          const accSnapshots = parsedAccessories.get(item.id) || [];
          const accTotal = item.accessoriesTotal || 0;
          const unitWithAcc = item.unitPriceSnapshot + accTotal;
          return (
            <ItemCard
              key={item.id}
              item={item}
              accSnapshots={accSnapshots}
              unitWithAcc={unitWithAcc}
            />
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0 scrollbar-hide">
        <table className="w-full min-w-[600px]">
          <thead className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-warm-gray/60 border-b border-warm-sand/30">
            <tr className="text-left">
              <th className="pb-4">Produk</th>
              <th className="pb-4 text-center">Jumlah</th>
              <th className="pb-4 text-right">Harga</th>
              <th className="pb-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-sand/20">
            {items.map((item) => {
              const accSnapshots = parsedAccessories.get(item.id) || [];
              const accTotal = item.accessoriesTotal || 0;
              const unitWithAcc = item.unitPriceSnapshot + accTotal;
              return (
                <ItemRow
                  key={item.id}
                  item={item}
                  accSnapshots={accSnapshots}
                  unitWithAcc={unitWithAcc}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <TotalsSummary
        productSubtotal={productSubtotal}
        discountAmount={discountAmount}
        couponCode={couponCode}
        shippingCost={shippingCost}
        shippingZoneName={shippingZoneName}
        totalAmount={totalAmount}
      />
    </section>
  );
}

function ItemCard({
  item,
  accSnapshots,
  unitWithAcc,
}: {
  item: OrderItem;
  accSnapshots: { name: string; price: number }[];
  unitWithAcc: number;
}) {
  return (
    <div className="bg-cream/20 p-5 rounded-[28px] ring-1 ring-warm-sand/30 space-y-4">
      <div className="flex items-start gap-4">
        <ProductImage images={item.product.images} name={item.productNameSnapshot} size="sm" />
        <div className="min-w-0 pr-2">
          <p className="font-bold text-dark-brown text-sm line-clamp-2 leading-tight">
            {item.productNameSnapshot}
          </p>
          <p className="text-[10px] text-warm-gray mt-1 italic font-medium">
            ID: {item.product.slug}
          </p>
          {accSnapshots.length > 0 && (
            <AccessoriesList accessories={accSnapshots} mobile />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-warm-sand/30">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60">
            Qty
          </span>
          <span className="font-bold text-dark-brown text-sm">
            {item.quantity}x
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-warm-gray/60">
            Total
          </span>
          <span className="font-black text-terracotta text-sm">
            {formatCurrency(unitWithAcc * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  accSnapshots,
  unitWithAcc,
}: {
  item: OrderItem;
  accSnapshots: { name: string; price: number }[];
  unitWithAcc: number;
}) {
  return (
    <tr className="group">
      <td className="py-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <ProductImage images={item.product.images} name={item.productNameSnapshot} size="md" />
          <div className="min-w-0 pr-2">
            <p className="font-bold text-dark-brown text-sm sm:text-base line-clamp-2">
              {item.productNameSnapshot}
            </p>
            {accSnapshots.length > 0 && (
              <AccessoriesList accessories={accSnapshots} />
            )}
            <p className="text-xs text-warm-gray truncate font-medium">
              ID: {item.product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="py-5 text-center font-bold text-dark-brown text-sm sm:text-base">
        {item.quantity}
      </td>
      <td className="py-5 text-right text-sm text-warm-gray whitespace-nowrap font-medium">
        {formatCurrency(unitWithAcc)}
      </td>
      <td className="py-5 text-right font-black text-dark-brown whitespace-nowrap">
        {formatCurrency(unitWithAcc * item.quantity)}
      </td>
    </tr>
  );
}

function ProductImage({
  images,
  name,
  size,
}: {
  images: { url: string }[];
  name: string;
  size: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-14 w-14" : "h-14 w-14 sm:h-16 sm:w-16";
  return (
    <div
      className={`${dimensions} rounded-2xl bg-warm-sand/20 flex shrink-0 items-center justify-center ring-1 ring-warm-sand/50 overflow-hidden relative`}
    >
      {images?.[0]?.url ? (
        <Image
          src={getImageUrl(images[0].url)}
          alt={name}
          fill
          className="object-cover"
        />
      ) : (
        <ImageIcon className="text-2xl text-warm-gray/30 absolute" />
      )}
    </div>
  );
}

function AccessoriesList({
  accessories,
  mobile,
}: {
  accessories: { name: string; price: number }[];
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "mt-2 space-y-1" : "mt-0.5 space-y-0.5"}>
      {accessories.map((acc, idx) => (
        <p
          key={idx}
          className={`${mobile ? "text-[10px]" : "text-[11px]"} text-sage font-bold leading-tight`}
        >
          + {acc.name} ({formatCurrency(acc.price)})
        </p>
      ))}
    </div>
  );
}

function TotalsSummary({
  productSubtotal,
  discountAmount,
  couponCode,
  shippingCost,
  shippingZoneName,
  totalAmount,
}: {
  productSubtotal: number;
  discountAmount: number | null;
  couponCode: string | null;
  shippingCost: number | null;
  shippingZoneName: string | null;
  totalAmount: number;
}) {
  return (
    <div className="mt-8 pt-8 border-t-2 border-dashed border-warm-sand/40 flex justify-end">
      <div className="w-full sm:w-64 space-y-3">
        <div className="flex justify-between text-sm text-warm-gray">
          <span className="font-medium">Subtotal Produk</span>
          <span className="font-bold">{formatCurrency(productSubtotal)}</span>
        </div>
        {(discountAmount ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-sage">
            <span className="font-medium">
              Diskon
              {couponCode ? ` (${couponCode})` : ""}
            </span>
            <span className="font-bold">-{formatCurrency(discountAmount ?? 0)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-warm-gray">
          <span className="font-medium">
            Ongkir
            {shippingZoneName && ` (${shippingZoneName})`}
          </span>
          <span className="font-bold">
            {(shippingCost ?? 0) === 0 ? (
              <span className="text-sage">Gratis</span>
            ) : (
              formatCurrency(shippingCost ?? 0)
            )}
          </span>
        </div>
        <div className="flex justify-between text-lg pt-2">
          <span className="font-display font-black text-dark-brown">
            Grand Total
          </span>
          <span className="font-display font-black text-terracotta">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}