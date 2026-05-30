import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { PaginationControls } from "@/components/product/pagination-controls";
import { getProductListPage } from "@/lib/product-queries";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Koleksi dTeman",
  description:
    "Jelajahi koleksi boneka rajut yoga dari D`TEMAN YOGA. Teman setia untuk setiap asana Anda.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    url: `${SITE_URL}/products`,
    title: "Koleksi dTeman",
    description:
      "Jelajahi koleksi boneka rajut yoga dari D`TEMAN YOGA. Teman setia untuk setiap asana Anda.",
  },
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort = sortParam || "latest";
  const data = await getProductListPage(page, 12, sort);

  const dateActive = sort === "latest" || sort === "oldest";
  const priceActive = sort.startsWith("price");

  return (
    <div className="-mt-20 min-h-screen bg-canvas-oat pt-20 font-sans text-ink selection:bg-action selection:text-white overflow-x-hidden md:-mt-24 md:pt-24">
      {/* ─────────────────────────  HEADER  ───────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:px-8 sm:pt-14 md:pt-16 md:pb-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-paper px-5 py-2 shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-action" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-action sm:text-[11px]">
            Curated Artisanal Crafts
          </span>
        </span>
        <h1 className="mt-6 font-bungee text-[clamp(2.25rem,9vw,5rem)] leading-[0.95] text-ink">
          Koleksi <span className="text-action">dTeman</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base md:text-lg">
          Temukan boneka rajut yang paling pas sebagai teman latihan harian
          Anda. Dibuat perlahan dengan ketulusan dan energi positif.
        </p>
      </section>

      {/* ─────────────────────  TOOLBAR + GRID  ───────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 md:pb-32">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft sm:text-sm">
            Menampilkan {data.products.length} dari {data.pagination.total}{" "}
            dTeman
          </p>

          <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 no-scrollbar sm:mx-0 sm:px-0 sm:pb-0">
            <Link
              href={`/products?sort=${sort === "latest" ? "oldest" : "latest"}&page=1`}
              className={cn(
                "flex h-11 shrink-0 snap-start items-center whitespace-nowrap rounded-full px-5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors sm:text-[13px]",
                dateActive
                  ? "bg-action text-white shadow-sm"
                  : "border border-black/10 bg-paper text-ink hover:border-action",
              )}
            >
              {sort === "oldest" ? "Koleksi Klasik" : "Koleksi Terbaru"}
            </Link>

            <Link
              href={`/products?sort=${sort === "price-asc" ? "price-desc" : "price-asc"}&page=1`}
              className={cn(
                "flex h-11 shrink-0 snap-start items-center whitespace-nowrap rounded-full px-5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors sm:text-[13px]",
                priceActive
                  ? "bg-action text-white shadow-sm"
                  : "border border-black/10 bg-paper text-ink hover:border-action",
              )}
            >
              Harga{" "}
              {sort === "price-asc"
                ? "Termurah"
                : sort === "price-desc"
                  ? "Termahal"
                  : ""}
            </Link>
          </div>
        </div>

        <ProductGrid products={data.products} />

        <div className="mt-14 flex justify-center md:mt-16">
          <PaginationControls
            pagination={data.pagination}
            basePath="/products"
            sort={sort}
          />
        </div>
      </section>
    </div>
  );
}
