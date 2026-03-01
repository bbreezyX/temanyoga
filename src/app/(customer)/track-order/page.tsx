import type { Metadata } from "next";
import { TrackOrderWrapper } from "./track-order-wrapper";

export const metadata: Metadata = {
  title: "Lacak Pesanan | D'TEMAN YOGA",
  description:
    "Lacak status pesanan boneka rajut yoga Anda dengan mudah. Masukkan kode pesanan untuk melihat pembaruan terbaru.",
  alternates: {
    canonical: "https://ditemaniyoga.com/track-order",
  },
};

export default function TrackOrderPage() {
  return <TrackOrderWrapper />;
}
