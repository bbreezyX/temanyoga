import type { OrderStatus } from "@prisma/client";
import { getStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const label = getStatusLabel(status);

  const styles = {
    PENDING_PAYMENT: {
      badge: "bg-amber-50 text-amber-600 ring-amber-600/20",
      dot: "bg-amber-600",
    },
    AWAITING_VERIFICATION: {
      badge: "bg-blue-50 text-blue-600 ring-blue-600/20",
      dot: "bg-blue-600",
    },
    PAID: {
      badge: "bg-sage/10 text-sage ring-sage/20",
      dot: "bg-sage",
    },
    PROCESSING: {
      badge: "bg-blue-50 text-blue-600 ring-blue-600/20",
      dot: "bg-blue-600",
    },
    SHIPPED: {
      badge: "bg-warm-gray/10 text-warm-gray ring-warm-gray/20",
      dot: "bg-warm-gray",
    },
    COMPLETED: {
      badge: "bg-sage/10 text-sage ring-sage/20",
      dot: "bg-sage",
    },
    CANCELLED: {
      badge: "bg-terracotta/10 text-terracotta ring-terracotta/20",
      dot: "bg-terracotta",
    },
  };

  const defaultStyle = {
    badge: "bg-cream text-dark-brown ring-warm-sand/50",
    dot: "bg-dark-brown",
  };

  const currentStyle = styles[status] || defaultStyle;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 h-6 text-[10px] font-black uppercase tracking-wider ring-1 transition-all whitespace-nowrap",
        currentStyle.badge,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", currentStyle.dot)}
      ></span>
      <span className="leading-none">{label}</span>
    </span>
  );
}
