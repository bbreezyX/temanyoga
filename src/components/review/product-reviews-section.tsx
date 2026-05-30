import Link from "next/link";
import { MessageSquare, Pencil } from "lucide-react";
import { ReviewList } from "@/components/review/review-list";
import type { ReviewListResponse } from "@/types/api";

export function ProductReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: ReviewListResponse) {
  return (
    <section id="ulasan" className="mt-16 border-t border-[#eadfce] pt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2.5 font-serif text-2xl font-bold text-[#2d241c]">
          <MessageSquare className="h-6 w-6 text-[#c85a2d]" />
          Ulasan
        </h2>
        <Link
          href="/ulas"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f0e7da] px-4 py-2 text-[13px] font-bold text-[#2d241c] transition-colors hover:bg-[#e8dcc8]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Tulis Ulasan
        </Link>
      </div>

      <ReviewList
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />
    </section>
  );
}
