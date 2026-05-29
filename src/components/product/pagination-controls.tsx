import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types/api";

export function PaginationControls({
  pagination,
  basePath,
  sort,
}: {
  pagination: Pagination;
  basePath: string;
  sort?: string;
}) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const getUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", p.toString());
    if (sort) params.set("sort", sort);
    return `${basePath}?${params.toString()}`;
  };

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-paper text-ink transition-colors hover:border-action hover:text-action";

  return (
    <nav
      aria-label="Paginasi"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        href={getUrl(page - 1)}
        aria-disabled={page <= 1}
        className={cn(navBtn, page <= 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Sebelumnya</span>
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={getUrl(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
            p === page
              ? "bg-action text-white shadow-sm"
              : "border border-black/10 bg-paper text-ink hover:border-action hover:text-action",
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={getUrl(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          navBtn,
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Berikutnya</span>
      </Link>
    </nav>
  );
}
