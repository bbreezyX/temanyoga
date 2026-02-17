"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  orderItemId: string;
  productName: string;
  onSubmit: (orderItemId: string, rating: number, comment: string) => Promise<void>;
  onSuccess?: () => void;
}

export function ReviewForm({ orderItemId, productName, onSubmit, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pilih rating terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(orderItemId, rating, comment);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Beri rating untuk <span className="font-bold">{productName}</span>
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  value <= (hoveredRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Komentar (opsional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-slate-500 mt-1">{comment.length}/1000 karakter</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
        {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
      </Button>
    </form>
  );
}