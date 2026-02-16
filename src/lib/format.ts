import { OrderStatus, PaymentProofStatus } from "@/generated/prisma/enums";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: string | Date): string {
  return dateFormatter.format(new Date(date));
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: string | Date): string {
  return dateTimeFormatter.format(new Date(date));
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

const STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  PENDING_PAYMENT: "outline",
  AWAITING_VERIFICATION: "secondary",
  PAID: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export function getStatusVariant(status: OrderStatus): BadgeVariant {
  return STATUS_VARIANTS[status] ?? "outline";
}

const PROOF_STATUS_LABELS: Record<PaymentProofStatus, string> = {
  PENDING: "Menunggu Review",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export function getProofStatusLabel(status: PaymentProofStatus): string {
  return PROOF_STATUS_LABELS[status] ?? status;
}

const PROOF_STATUS_VARIANTS: Record<PaymentProofStatus, BadgeVariant> = {
  PENDING: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
};

export function getProofStatusVariant(status: PaymentProofStatus): BadgeVariant {
  return PROOF_STATUS_VARIANTS[status] ?? "outline";
}
