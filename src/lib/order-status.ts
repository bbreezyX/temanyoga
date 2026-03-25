import { OrderStatus } from "@/generated/prisma/client";
import { InvalidStatusTransitionError } from "./errors";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [OrderStatus.AWAITING_VERIFICATION, OrderStatus.CANCELLED],
  AWAITING_VERIFICATION: [
    OrderStatus.PAID,
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.CANCELLED,
  ],
  PAID: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export function validateStatusTransition(
  from: OrderStatus,
  to: OrderStatus
): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}
