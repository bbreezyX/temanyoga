import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { PaginationControls } from "@/components/product/pagination-controls";
import { prisma } from "@/lib/prisma";
import type { ProductListItem } from "@/types/api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Koleksi dTeman",
  description:
    "Jelajahi koleksi boneka rajut yoga dari D`TEMAN YOGA. Teman setia untuk setiap asana Anda.",
};

export const revalidate = 60;

async function getProducts(page: number, limit: number, sort: string = "latest") {
  const orderBy: any = {};
  switch (sort) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "oldest":
      orderBy.createdAt = "asc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy,
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
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort = sortParam || "latest";
  const data = await getProducts(page, 12, sort);

  return (
    <div className="bg-[#f5f1ed] min-h-screen text-slate-900 font-sans selection:bg-[#c85a2d] selection:text-white pb-24">
      <div className="pt-32 px-6 md:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c85a2d]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Curated Artisanal Crafts
          </span>
        </div>
        <h1 className="font-display text-[56px] md:text-[84px] font-black leading-[0.9] tracking-tighter">
          Koleksi <span className="text-[#c85a2d] italic serif font-medium">Teman</span> Yoga
        </h1>
        <p className="max-w-[42ch] mx-auto text-slate-500 font-medium leading-relaxed">
          Temukan boneka rajut yang paling pas sebagai teman latihan harian Anda. 
          Dibuat perlahan dengan ketulusan dan energi positif.
        </p>
      </div>

      <div className="mt-24 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12 md:mb-16">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Eksplorasi Kurasi Kami
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#7a9d7f]"></div>
              <span className="text-sm font-bold text-slate-400">
                Menampilkan {data.products.length} dari {data.pagination.total} dTeman
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href={`/products?sort=${sort === "latest" ? "oldest" : "latest"}&page=1`}
              className={cn(
                "h-12 px-6 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                sort === "latest" || sort === "oldest"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white ring-1 ring-slate-200 hover:ring-[#c85a2d]/30"
              )}
            >
              {sort === "oldest" ? "Koleksi Klasik" : "Koleksi Terbaru"}
            </Link>
            
            <Link
              href={`/products?sort=${sort === "price-asc" ? "price-desc" : "price-asc"}&page=1`}
              className={cn(
                "h-12 px-6 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                sort.startsWith("price")
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white ring-1 ring-slate-200 hover:ring-[#c85a2d]/30"
              )}
            >
              Harga {sort === "price-asc" ? "Low-High" : sort === "price-desc" ? "High-Low" : ""}
            </Link>
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
              sort={sort}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
