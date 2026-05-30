import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CheckoutSkeleton } from "./checkout-skeleton";

const CheckoutClient = dynamic(
  () =>
    import("./checkout-client").then((mod) => ({ default: mod.CheckoutClient })),
  { loading: () => <CheckoutSkeleton /> },
);

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Selesaikan pesanan boneka rajut yoga Anda. Isi informasi pengiriman dan lakukan pembayaran.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
