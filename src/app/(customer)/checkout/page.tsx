import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

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
