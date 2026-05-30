"use client";

import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WilayahItem } from "@/hooks/use-wilayah";

const VARIANT_STYLES = {
  customer: {
    loading:
      "h-14 w-full rounded-full bg-[#faf6f0] border border-[#e8dcc8] px-6 flex items-center gap-3",
    loadingText: "text-[14px] text-[#9a8772]",
    spinner: "text-[#c85a2d]",
    trigger:
      "!h-14 w-full !rounded-full bg-[#faf6f0] border-[#e8dcc8] px-6 text-[16px] text-[#2d241c] font-medium focus:ring-0 focus:border-[#c85a2d] focus:shadow-none data-[placeholder]:text-[#9a8772] disabled:opacity-50 disabled:cursor-not-allowed",
    item: "text-[15px] font-medium py-3 px-3 rounded-xl focus:bg-[#fdf8f6] focus:text-[#2d241c]",
    content: "max-h-60 rounded-2xl w-[var(--radix-select-trigger-width)]",
    scroll: "max-h-56 overflow-y-auto p-1",
    error: "text-xs text-red-500 font-medium px-1",
  },
  admin: {
    loading:
      "h-12 w-full rounded-xl bg-cream/30 border border-warm-sand/40 px-4 flex items-center gap-3",
    loadingText: "text-sm text-warm-gray",
    spinner: "text-terracotta",
    trigger:
      "h-12 w-full rounded-xl bg-cream/30 border border-warm-sand/40 px-4 text-sm text-dark-brown font-medium focus:ring-0 focus:border-terracotta focus:shadow-none data-[placeholder]:text-warm-gray/60 disabled:opacity-50 disabled:cursor-not-allowed",
    item: "text-sm font-medium py-2.5 px-3 rounded-lg focus:bg-cream/50 focus:text-dark-brown",
    content: "max-h-60 rounded-xl w-[var(--radix-select-trigger-width)]",
    scroll: "max-h-56 overflow-y-auto p-1",
    error: "text-xs text-red-500 font-medium",
  },
} as const;

interface WilayahSelectProps {
  placeholder: string;
  items: WilayahItem[] | undefined;
  value: string | null;
  onChange: (item: WilayahItem | null) => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string;
  variant?: keyof typeof VARIANT_STYLES;
}

export function WilayahSelect({
  placeholder,
  items,
  value,
  onChange,
  isLoading,
  disabled,
  error,
  variant = "customer",
}: WilayahSelectProps) {
  const styles = VARIANT_STYLES[variant];

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={cn("h-4 w-4 animate-spin", styles.spinner)} />
        <span className={styles.loadingText}>Memuat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value ?? undefined}
        onValueChange={(val) => {
          const item = items?.find((i) => i.code === val);
          onChange(item ?? null);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(styles.trigger, error && "border-red-300")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={styles.content}
          position="popper"
          sideOffset={4}
        >
          <div className={styles.scroll}>
            {items?.map((item) => (
              <SelectItem
                key={item.code}
                value={item.code}
                className={styles.item}
              >
                {item.name}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
