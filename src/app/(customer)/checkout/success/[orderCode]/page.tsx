import type { Metadata } from "next";
import {
  getOrderStatusByCode,
  getPublicBankSettings,
} from "@/lib/order-queries";
import { OrderNotFound } from "@/components/order/order-not-found";
import { CheckoutSuccessClient } from "./checkout-success-client";

export const metadata: Metadata = {
  title: "Konfirmasi Pesanan",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderCode: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { orderCode } = await params;
  const { email } = await searchParams;

  const [order, bankSettings] = await Promise.all([
    getOrderStatusByCode(orderCode),
    getPublicBankSettings(),
  ]);

  if (!order) {
    return <OrderNotFound />;
  }

  return (
    <CheckoutSuccessClient
      orderCode={orderCode}
      order={order}
      bankSettings={bankSettings}
      initialEmail={email ?? ""}
    />
  );
}
