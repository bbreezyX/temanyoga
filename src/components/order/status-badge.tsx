import type { OrderStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusVariant } from "@/lib/format";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
  );
}
