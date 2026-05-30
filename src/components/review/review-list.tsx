"use client";

import { Star } from "lucide-react";
import type { ReviewItem } from "@/types/api";

interface ReviewListProps {
  reviews: ReviewItem[];
  averageRating: number;
  totalReviews: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${className ?? "h-3.5 w-3.5"} ${
            value <= rating
              ? "fill-[#c85a2d] text-[#c85a2d]"
              : "fill-[#e8dcc8] text-[#e8dcc8]"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, averageRating, totalReviews }: ReviewListProps) {
  if (totalReviews === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#eadfce] bg-white/60 px-6 py-12 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#fdf3ee] text-[#c85a2d]">
          <Star className="h-6 w-6" />
        </div>
        <p className="text-[16px] font-bold text-[#2d241c]">Belum ada ulasan</p>
        <p className="mt-1 text-[14px] text-[#6b5b4b]">
          Jadilah yang pertama memberikan ulasan!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-5 rounded-[28px] border border-[#eadfce] bg-white p-5 shadow-soft md:p-6">
        <div className="flex shrink-0 flex-col items-center justify-center rounded-[20px] bg-[#faf6f0] px-6 py-4">
          <span className="font-display text-[32px] leading-none text-[#c85a2d]">
            {averageRating.toFixed(1)}
          </span>
          <Stars
            rating={Math.round(averageRating)}
            className="mt-2 h-3.5 w-3.5"
          />
        </div>
        <div>
          <p className="text-[18px] font-bold text-[#2d241c]">
            Ulasan Pelanggan
          </p>
          <p className="mt-0.5 text-[14px] text-[#6b5b4b]">
            Berdasarkan {totalReviews} ulasan
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const initial =
            review.customerName.trim().charAt(0).toUpperCase() || "?";
          return (
            <article
              key={review.id}
              className="rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-soft md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fdf3ee] text-[15px] font-bold text-[#c85a2d]">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[15px] font-bold text-[#2d241c]">
                      {review.customerName}
                    </p>
                    <span className="shrink-0 text-[12px] text-[#9a8772]">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <Stars rating={review.rating} className="mt-1.5 h-3.5 w-3.5" />
                  {review.comment && (
                    <p className="mt-3 text-[15px] leading-relaxed text-[#6b5b4b]">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
