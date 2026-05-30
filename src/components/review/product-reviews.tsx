"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Pencil } from "lucide-react";
import { ReviewList } from "@/components/review/review-list";
import { Skeleton } from "@/components/ui/skeleton";
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
      <section id="ulasan" className="mt-16 border-t border-[#eadfce] pt-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-32 rounded-full bg-[#dcd0bf]" />
          <Skeleton className="h-9 w-28 rounded-full bg-[#dcd0bf]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-[28px] bg-[#dcd0bf]" />
          <Skeleton className="h-28 w-full rounded-[24px] bg-[#dcd0bf]" />
          <Skeleton className="h-28 w-full rounded-[24px] bg-[#dcd0bf]" />
        </div>
      </section>
    );
  }

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