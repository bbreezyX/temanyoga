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

export function ReviewList({ reviews, averageRating, totalReviews }: ReviewListProps) {
  if (totalReviews === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">Belum ada ulasan</div>
        <p className="text-sm text-slate-500">Jadilah yang pertama memberikan ulasan!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-slate-900">{averageRating}</span>
          <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-slate-600">{totalReviews} ulasan</p>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`w-4 h-4 ${
                      value <= review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="font-medium text-slate-900 mb-1">{review.customerName}</p>
            <p className="text-xs text-slate-500 mb-3">{formatDate(review.createdAt)}</p>
            {review.comment && (
              <p className="text-slate-700 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}