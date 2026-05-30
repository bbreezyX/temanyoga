import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CartPageHeader } from "@/components/cart/cart-page-header";
import { CartPageSkeleton } from "./cart-page-skeleton";

const CartPageClient = dynamic(() => import("./cart-page-client"), {
  loading: () => <CartPageSkeleton showHeader={false} />,
});

export const metadata: Metadata = {
  title: "Keranjang Belanja",
  description:
    "Lihat dan kelola boneka rajut yoga pilihan Anda sebelum checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-[#2d241c] md:-mt-24 md:pt-24">
      <div
        className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 md:px-12"
        id="top"
      >
        <section className="pt-12 md:pt-16">
          <CartPageHeader />
          <CartPageClient />
        </section>
      </div>
    </div>
  );
}
