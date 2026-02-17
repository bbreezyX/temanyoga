import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { PaginationControls } from "@/components/product/pagination-controls";
import { prisma } from "@/lib/prisma";
import type { ProductListItem } from "@/types/api";

export const metadata: Metadata = {
  title: "Koleksi dTeman",
  description:
    "Jelajahi koleksi boneka rajut yoga dari dTeman Yoga. Teman setia untuk setiap asana Anda.",
};

export const revalidate = 60;

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
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans selection:bg-[#c85a2d] selection:text-white pb-24">
      {/* 
        EDITORIAL HERO SECTION 
        Signature: Dramatic scale, overlapping elements, and organic textures
      */}

      {/* 
        PRODUCTS GRID SECTION 
        The actual grid is rendered via ProductGrid component
      */}
      <div className="mt-16 md:mt-24 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12 md:mb-16">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">
              Eksplorasi Semua
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#7a9d7f]"></div>
              <span className="text-sm font-bold text-slate-400">
                {data.pagination.total} Produk Tersedia
              </span>
            </div>
          </div>

          {/* Subtle Filter/Sort Action (Placeholder style but polished) */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="h-12 px-6 rounded-full bg-white ring-1 ring-slate-200 text-sm font-bold hover:ring-[#c85a2d]/30 transition-all">
              Terbaru
            </button>
            <button className="h-12 px-6 rounded-full bg-white ring-1 ring-slate-200 text-sm font-bold hover:ring-[#c85a2d]/30 transition-all">
              Harga
            </button>
          </div>
        </div>

        <ProductGrid products={data.products as unknown as ProductListItem[]} />

        {/* 
          PAGINATION
        */}
        <div className="mt-24 flex justify-center">
          <div className="relative p-2 rounded-full bg-white shadow-soft ring-1 ring-slate-100">
            <PaginationControls
              pagination={data.pagination}
              basePath="/products"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
