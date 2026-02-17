"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Pilih rating terlebih dahulu").max(5),
  comment: z.string().max(1000, "Komentar maksimal 1000 karakter").optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  orderItemId: string;
  productName: string;
  onSubmit: (orderItemId: string, rating: number, comment: string) => Promise<void>;
  onSuccess?: () => void;
}

export function ReviewForm({ orderItemId, productName, onSubmit, onSuccess }: ReviewFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");
  const comment = watch("comment");

  const handleFormSubmit = async (data: ReviewFormData) => {
    try {
      await onSubmit(orderItemId, data.rating, data.comment || "");
      onSuccess?.();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Beri rating untuk <span className="font-bold">{productName}</span>
        </p>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onClick={() => field.onChange(value)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-red-500 font-medium mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Komentar (opsional)
        </label>
        <Textarea
          {...register("comment")}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          rows={4}
        />
        <p className="text-xs text-slate-500 mt-1">{comment?.length || 0}/1000 karakter</p>
        {errors.comment && (
          <p className="text-xs text-red-500 font-medium mt-1">{errors.comment.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
        {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
      </Button>
    </form>
  );
}