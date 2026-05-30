import { AdminOrdersCatalog } from "@/components/admin/orders/admin-orders-catalog";
import {
  getAdminOrderList,
  parseAdminOrderCatalogParams,
} from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseAdminOrderCatalogParams(await searchParams);
  const data = await getAdminOrderList(params);
  const catalogKey = `${params.page}|${params.search}|${params.status}|${params.dateFrom}|${params.dateTo}|${params.limit}`;

  return <AdminOrdersCatalog key={catalogKey} data={data} params={params} />;
}
