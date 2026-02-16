import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { PaginationControls } from "@/components/product/pagination-controls";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Produk",
  description: "Jelajahi koleksi gantungan kunci handmade dari Temanyoga.",
};

export const dynamic = "force-dynamic";

async function getProducts(page: number, limit: number) {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await getProducts(page, 12);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Semua Produk</h1>
      <ProductGrid products={data.products as any} />
      <PaginationControls pagination={data.pagination} basePath="/products" />
    </div>
  );
}
