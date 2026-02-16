import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/types/api";

export function PaginationControls({
  pagination,
  basePath,
}: {
  pagination: Pagination;
  basePath: string;
}) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button variant="outline" size="icon" asChild disabled={page <= 1}>
        <Link
          href={`${basePath}?page=${page - 1}`}
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
          asChild
        >
          <Link href={`${basePath}?page=${p}`}>{p}</Link>
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={page >= totalPages}
      >
        <Link
          href={`${basePath}?page=${page + 1}`}
          aria-disabled={page >= totalPages}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
