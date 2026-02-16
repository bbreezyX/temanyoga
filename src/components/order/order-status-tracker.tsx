import { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/format";
import { Check } from "lucide-react";

const STEPS: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.AWAITING_VERIFICATION,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
];

function getStepIndex(status: OrderStatus): number {
  if (status === OrderStatus.CANCELLED) return -1;
  return STEPS.indexOf(status);
}

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const currentIndex = getStepIndex(status);
  const isCancelled = status === OrderStatus.CANCELLED;

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center">
        <p className="font-semibold text-destructive">Pesanan Dibatalkan</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between overflow-x-auto">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground",
                    active && "ring-2 ring-primary/30"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-center leading-tight max-w-[72px]",
                    done ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {getStatusLabel(step)}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1",
                    i < currentIndex ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
