import TrackOrderContent from "../track-order-content";
import { getOrderStatusByCode } from "@/lib/order-queries";
import { OrderNotFound } from "@/components/order/order-not-found";

export default async function TrackOrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const order = await getOrderStatusByCode(orderCode);

  if (!order) {
    return <OrderNotFound />;
  }

  return (
    <TrackOrderContent initialCode={orderCode} initialOrder={order} />
  );
}
