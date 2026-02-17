import type { OrderStatus } from "@prisma/client";
import { getStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const label = getStatusLabel(status);

  const getStyles = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-amber-50 text-amber-600 ring-amber-600/20 dot-amber-600";
      case "AWAITING_VERIFICATION":
        return "bg-blue-50 text-blue-600 ring-blue-600/20 dot-blue-600";
      case "PAID":
        return "bg-sage/10 text-sage ring-sage/20 dot-sage";
      case "PROCESSING":
        return "bg-blue-50 text-blue-600 ring-blue-600/20 dot-blue-600";
      case "SHIPPED":
        return "bg-warm-gray/10 text-warm-gray ring-warm-gray/20 dot-warm-gray";
      case "COMPLETED":
        return "bg-sage/10 text-sage ring-sage/20 dot-sage";
      case "CANCELLED":
        return "bg-terracotta/10 text-terracotta ring-terracotta/20 dot-terracotta";
      default:
        return "bg-cream text-dark-brown ring-warm-sand/50 dot-dark-brown";
    }
  };

  const styles = getStyles(status);
  const dotColor =
    styles
      .split(" ")
      .find((s) => s.startsWith("dot-"))
      ?.replace("dot-", "bg-") || "bg-current";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition-all",
        styles,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)}></span>
      {label}
    </span>
  );
}
