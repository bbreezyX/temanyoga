import type { OrderStatus } from "@prisma/client";

type OrderData = {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
};

type TrackingData = {
  courier: string;
  trackingNumber: string;
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ─── Customer Messages ───────────────────────────────────────────────────────

/**
 * Message sent to customer after order is created.
 * Includes bank account details for payment.
 */
export function orderCreatedCustomer(
  order: OrderData,
  siteUrl: string
): string {
  const lines = [
    `Halo ${order.customerName}!`,
    ``,
    `Pesanan Anda telah berhasil dibuat.`,
    ``,
    `Kode Pesanan: *${order.orderCode}*`,
    `Total: *${formatRupiah(order.totalAmount)}*`,
  ];

  if (order.discountAmount > 0) {
    lines.push(`Diskon: -${formatRupiah(order.discountAmount)}`);
  }
  if (order.shippingCost > 0) {
    lines.push(`Ongkir: ${formatRupiah(order.shippingCost)}`);
  }

  lines.push(
    ``,
    `Silakan transfer ke salah satu rekening berikut:`,
    ``,
    `*Bank BCA*`,
    `No. Rek: 1234567890`,
    `a/n TemanYoga Studio`,
    ``,
    `*Bank Mandiri*`,
    `No. Rek: 0987654321`,
    `a/n TemanYoga Studio`,
    ``,
    `Setelah transfer, upload bukti pembayaran di:`,
    `${siteUrl}/checkout/success?code=${order.orderCode}`,
    ``,
    `Lacak pesanan Anda:`,
    `${siteUrl}/track-order?code=${order.orderCode}`,
    ``,
    `Terima kasih telah berbelanja di Temanyoga!`
  );

  return lines.join("\n");
}

/**
 * Message sent to customer when payment is approved.
 */
export function paymentApprovedCustomer(
  orderCode: string,
  customerName: string,
  siteUrl: string
): string {
  return [
    `Halo ${customerName}!`,
    ``,
    `Pembayaran untuk pesanan *${orderCode}* telah diverifikasi.`,
    `Pesanan Anda sedang diproses.`,
    ``,
    `Lacak pesanan Anda:`,
    `${siteUrl}/track-order?code=${orderCode}`,
    ``,
    `Terima kasih!`,
  ].join("\n");
}

/**
 * Message sent to customer when payment is rejected.
 */
export function paymentRejectedCustomer(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string
): string {
  const lines = [
    `Halo ${customerName},`,
    ``,
    `Mohon maaf, bukti pembayaran untuk pesanan *${orderCode}* tidak dapat diverifikasi.`,
  ];

  if (reason) {
    lines.push(`Alasan: ${reason}`);
  }

  lines.push(
    ``,
    `Silakan upload ulang bukti pembayaran di:`,
    `${siteUrl}/checkout/success?code=${orderCode}`,
    ``,
    `Jika ada pertanyaan, silakan hubungi kami.`
  );

  return lines.join("\n");
}

/**
 * Message sent to customer when order is shipped.
 */
export function orderShippedCustomer(
  orderCode: string,
  customerName: string,
  tracking: TrackingData,
  siteUrl: string
): string {
  return [
    `Halo ${customerName}!`,
    ``,
    `Pesanan *${orderCode}* telah dikirim.`,
    ``,
    `Kurir: *${tracking.courier}*`,
    `No. Resi: *${tracking.trackingNumber}*`,
    ``,
    `Lacak pesanan Anda:`,
    `${siteUrl}/track-order?code=${orderCode}`,
    ``,
    `Terima kasih telah berbelanja di Temanyoga!`,
  ].join("\n");
}

/**
 * Message sent to customer when order is completed.
 */
export function orderCompletedCustomer(
  orderCode: string,
  customerName: string
): string {
  return [
    `Halo ${customerName}!`,
    ``,
    `Pesanan *${orderCode}* telah selesai.`,
    ``,
    `Terima kasih telah berbelanja di Temanyoga!`,
    `Kami harap Anda puas dengan produk kami.`,
  ].join("\n");
}

/**
 * Message sent to customer when order is cancelled.
 */
export function orderCancelledCustomer(
  orderCode: string,
  customerName: string
): string {
  return [
    `Halo ${customerName},`,
    ``,
    `Pesanan *${orderCode}* telah dibatalkan.`,
    ``,
    `Jika Anda merasa ini adalah kesalahan atau memiliki pertanyaan, silakan hubungi kami.`,
  ].join("\n");
}

/**
 * Get the appropriate customer message for a status change.
 * Returns null if no message should be sent for this status.
 */
export function getStatusChangeMessage(
  status: OrderStatus,
  orderCode: string,
  customerName: string,
  siteUrl: string,
  tracking?: TrackingData | null
): string | null {
  switch (status) {
    case "SHIPPED":
      if (tracking?.courier && tracking?.trackingNumber) {
        return orderShippedCustomer(orderCode, customerName, tracking, siteUrl);
      }
      return [
        `Halo ${customerName}!`,
        ``,
        `Pesanan *${orderCode}* telah dikirim.`,
        ``,
        `Lacak pesanan Anda:`,
        `${siteUrl}/track-order?code=${orderCode}`,
      ].join("\n");
    case "COMPLETED":
      return orderCompletedCustomer(orderCode, customerName);
    case "CANCELLED":
      return orderCancelledCustomer(orderCode, customerName);
    default:
      return null;
  }
}

// ─── Admin Messages ──────────────────────────────────────────────────────────

/**
 * Message sent to admin when a new order is created.
 */
export function orderCreatedAdmin(order: OrderData): string {
  return [
    `*Pesanan Baru!*`,
    ``,
    `Kode: *${order.orderCode}*`,
    `Nama: ${order.customerName}`,
    `Telp: ${order.customerPhone}`,
    `Total: *${formatRupiah(order.totalAmount)}*`,
  ].join("\n");
}

/**
 * Message sent to admin when payment proof is uploaded.
 */
export function paymentProofUploadedAdmin(
  orderCode: string,
  customerName: string
): string {
  return [
    `*Bukti Pembayaran Diunggah*`,
    ``,
    `Pesanan: *${orderCode}*`,
    `Dari: ${customerName}`,
    ``,
    `Silakan verifikasi di panel admin.`,
  ].join("\n");
}
