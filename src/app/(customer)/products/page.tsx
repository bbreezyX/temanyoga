import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { PaginationControls } from "@/components/product/pagination-controls";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { ProductListItem } from "@/types/api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Koleksi dTeman",
  description:
    "Jelajahi koleksi boneka rajut yoga dari D`TEMAN YOGA. Teman setia untuk setiap asana Anda.",
};

export const revalidate = 60;

async function getProducts(
  page: number,
  limit: number,
  sort: string = "latest",
) {
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};
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
    <div className="bg-white min-h-screen text-[#2d241c] font-sans selection:bg-[#c85a2d] selection:text-white pb-32">
      <div className="pt-24 px-8 md:px-12 max-w-[1600px] mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white border border-[#e8dcc8]/60 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#c85a2d] animate-pulse"></div>
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#c85a2d]">
            Curated Artisanal Crafts
          </span>
        </div>
        <h1 className="font-display text-[48px] md:text-[110px] font-black leading-[0.85] tracking-[-0.04em] text-[#2d241c]">
          Koleksi{" "}
          <span className="text-[#c85a2d] italic serif font-medium">
            dTeman
          </span>{" "}
          Yoga
        </h1>
        <p className="max-w-2xl mx-auto text-[16px] md:text-[18px] text-[#6b5b4b] font-medium leading-relaxed">
          Temukan boneka rajut yang paling pas sebagai teman latihan harian
          Anda. Dibuat perlahan dengan ketulusan dan energi positif.
        </p>
      </div>

      <div className="mt-20 md:mt-32 px-8 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 mb-16 md:mb-20">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#2d241c]">
              Eksplorasi Kurasi Kami
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7a9d7f]"></div>
              <span className="text-sm md:text-base font-bold text-[#6b5b4b] uppercase tracking-widest">
                Menampilkan {data.products.length} dari {data.pagination.total}{" "}
                dTeman
              </span>
            </div>
          </div>

          <div className="flex w-full md:w-auto overflow-x-auto pb-4 md:pb-0 gap-4 no-scrollbar snap-x">
            <Link
              href={`/products?sort=${sort === "latest" ? "oldest" : "latest"}&page=1`}
              className={cn(
                "h-14 px-8 rounded-full text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap snap-start shrink-0",
                sort === "latest" || sort === "oldest"
                  ? "bg-[#2d241c] text-white shadow-lift-sm"
                  : "bg-white border border-[#e8dcc8]/60 hover:border-[#c85a2d]/40",
              )}
            >
              {sort === "oldest" ? "Koleksi Klasik" : "Koleksi Terbaru"}
            </Link>

            <Link
              href={`/products?sort=${sort === "price-asc" ? "price-desc" : "price-asc"}&page=1`}
              className={cn(
                "h-14 px-8 rounded-full text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap snap-start shrink-0",
                sort.startsWith("price")
                  ? "bg-[#2d241c] text-white shadow-lift-sm"
                  : "bg-white border border-[#e8dcc8]/60 hover:border-[#c85a2d]/40",
              )}
            >
              Harga{" "}
              {sort === "price-asc"
                ? "Low to High"
                : sort === "price-desc"
                  ? "High to Low"
                  : ""}
            </Link>
          </div>
        </div>

        <ProductGrid products={data.products as unknown as ProductListItem[]} />

        {/* 
          PAGINATION
        */}
        <div className="mt-32 flex justify-center">
          <div className="relative p-3 rounded-full bg-white border border-[#e8dcc8]/60 shadow-lift-sm">
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
