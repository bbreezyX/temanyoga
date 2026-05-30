import { notFound } from "next/navigation";
import { AdminOrderDetailView } from "@/components/admin/orders/admin-order-detail-view";
import { getAdminOrderDetail } from "@/lib/admin-order-detail";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode: rawOrderCode } = await params;
  const orderCode = decodeURIComponent(rawOrderCode);
  const order = await getAdminOrderDetail(orderCode);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailView initialOrder={order} />;
}
