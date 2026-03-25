import { OrderStatus, PaymentProofStatus } from "@/generated/prisma/client";

export function formatCurrency(amount: number): string {
  // Use manual formatting to avoid SSR/client Intl locale mismatch
  // (Node.js and browsers may format "id-ID" currency differently)
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${formatted}`;
}

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}.${mm}`;
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
