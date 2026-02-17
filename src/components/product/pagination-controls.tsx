import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button variant="outline" size="icon" asChild disabled={page <= 1}>
        <Link
          href={getUrl(page - 1)}
          aria-disabled={page <= 1}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="icon"
          active={p === page}
          asChild
        >
          <Link href={getUrl(p)}>{p}</Link>
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={page >= totalPages}
      >
        <Link
          href={getUrl(page + 1)}
          aria-disabled={page >= totalPages}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
