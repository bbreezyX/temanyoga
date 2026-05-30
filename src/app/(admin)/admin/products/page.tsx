import { AdminProductsCatalog } from "@/components/admin/products/admin-products-catalog";
import {
  getAdminProductList,
  parseAdminProductCatalogParams,
} from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseAdminProductCatalogParams(await searchParams);
  const data = await getAdminProductList(params);

  return <AdminProductsCatalog data={data} params={params} />;
}
