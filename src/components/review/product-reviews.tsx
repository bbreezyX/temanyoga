"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ReviewList } from "@/components/review/review-list";
import { apiFetch } from "@/lib/api-client";
import type { ReviewListResponse } from "@/types/api";

interface ProductReviewsProps {
  productSlug: string;
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      const res = await apiFetch<ReviewListResponse>(
        `/api/products/${productSlug}/reviews`
      );
      if (res.success) {
        setReviews(res.data);
      }
      setLoading(false);
    }
    loadReviews();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-slate-100 rounded"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="ulasan" className="mt-16 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Ulasan
        </h2>
        <Link
          href="/ulas"
          className="text-sm font-medium text-[#c85a2d] hover:text-[#b04a25] transition-colors"
        >
          Tulis Ulasan
        </Link>
      </div>

      {reviews && (
        <ReviewList
          reviews={reviews.reviews}
          averageRating={reviews.averageRating}
          totalReviews={reviews.totalReviews}
        />
      )}
    </section>
  );
}