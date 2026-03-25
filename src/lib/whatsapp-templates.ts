import type { OrderStatus } from "@/generated/prisma/client";

type OrderData = {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
};

type BankData = {
  bankName: string;
  accountNumber: string;
  accountName: string;
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
  siteUrl: string,
  bank?: BankData,
): string {
  const lines = [
    `*Halo ${order.customerName}!* 👋`,
    ``,
    `Terima kasih telah berbelanja di *D'TEMAN YOGA*. Pesanan Anda telah berhasil dibuat.`,
    ``,
    `📦 *Detail Pesanan:*`,
    `• Kode: *${order.orderCode}*`,
    `• Total: *${formatRupiah(order.totalAmount)}*`,
  ];

  if (order.discountAmount > 0) {
    lines.push(`• Diskon: -${formatRupiah(order.discountAmount)}`);
  }
  if (order.shippingCost > 0) {
    lines.push(`• Ongkir: ${formatRupiah(order.shippingCost)}`);
  }

  lines.push(
    ``,
    `🏦 *Informasi Pembayaran:*`,
    `Silakan transfer ke rekening berikut:`,
    ``,
    `*Bank ${bank?.bankName || "BCA"}*`,
    `No. Rek: *${bank?.accountNumber || "1234567890"}*`,
    `a/n ${bank?.accountName || "D'TEMAN YOGA Studio"}`,
    ``,
    `📸 *Konfirmasi:*`,
    `Setelah transfer, mohon unggah bukti pembayaran di tautan berikut:`,
    `${siteUrl}/checkout/success/${order.orderCode}`,
    ``,
    `📍 *Lacak Pesanan:*`,
    `${siteUrl}/track-order/${order.orderCode}`,
    ``,
    `_Terima kasih telah menjadi bagian dari perjalanan yoga kami!_ 🙏`,
  );

  return lines.join("\n");
}

/**
 * Message sent to customer when payment is approved.
 */
export function paymentApprovedCustomer(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): string {
  return [
    `*Halo ${customerName}!* ✨`,
    ``,
    `Kabar baik! Pembayaran untuk pesanan *${orderCode}* telah kami verifikasi.`,
    `Pesanan Anda sedang kami siapkan untuk segera dikirim.`,
    ``,
    `📍 *Pantau Pesanan:*`,
    `${siteUrl}/track-order/${orderCode}`,
    ``,
    `Terima kasih atas kepercayaannya! 🙏`,
  ].join("\n");
}

/**
 * Message sent to customer when payment is rejected.
 */
export function paymentRejectedCustomer(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string,
): string {
  const lines = [
    `*Halo ${customerName},*`,
    ``,
    `Mohon maaf, bukti pembayaran untuk pesanan *${orderCode}* tidak dapat kami verifikasi.`,
  ];

  if (reason) {
    lines.push(``, `⚠️ *Alasan:* ${reason}`);
  }

  lines.push(
    ``,
    `📸 *Tindakan Diperlukan:*`,
    `Silakan unggah kembali bukti pembayaran yang valid melalui tautan di bawah ini agar kami dapat memproses pesanan Anda:`,
    `${siteUrl}/checkout/success/${orderCode}`,
    ``,
    `Jika ada kendala, jangan ragu untuk menghubungi kami. Terima kasih.`,
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
  siteUrl: string,
): string {
  return [
    `*Halo ${customerName}!* 🚚`,
    ``,
    `Pesanan *${orderCode}* Anda telah dikirim!`,
    ``,
    `📦 *Info Pengiriman:*`,
    `• Kurir: *${tracking.courier}*`,
    `• No. Resi: *${tracking.trackingNumber}*`,
    ``,
    `📍 *Lacak Pengiriman:*`,
    `${siteUrl}/track-order/${orderCode}`,
    ``,
    `Semoga produk kami segera sampai dengan selamat! 🙏`,
  ].join("\n");
}

/**
 * Message sent to customer when order is completed.
 */
export function orderCompletedCustomer(
  orderCode: string,
  customerName: string,
): string {
  return [
    `*Halo ${customerName}!* 🥳`,
    ``,
    `Pesanan *${orderCode}* telah dinyatakan selesai.`,
    ``,
    `Terima kasih banyak telah berbelanja di *D'TEMAN YOGA*. Kami harap produk kami dapat mendukung aktivitas yoga Anda dengan maksimal.`,
    ``,
    `Sampai jumpa di pesanan berikutnya! ✨`,
  ].join("\n");
}

/**
 * Message sent to customer when order is cancelled.
 */
export function orderCancelledCustomer(
  orderCode: string,
  customerName: string,
): string {
  return [
    `*Halo ${customerName},*`,
    ``,
    `Pesanan *${orderCode}* telah dibatalkan.`,
    ``,
    `Jika Anda merasa ini adalah kesalahan atau memiliki pertanyaan, silakan hubungi tim kami untuk bantuan lebih lanjut.`,
    ``,
    `Terima kasih.`,
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
  tracking?: TrackingData | null,
): string | null {
  switch (status) {
    case "SHIPPED":
      if (tracking?.courier && tracking?.trackingNumber) {
        return orderShippedCustomer(orderCode, customerName, tracking, siteUrl);
      }
      return [
        `*Halo ${customerName}!* 🚚`,
        ``,
        `Pesanan *${orderCode}* telah dikirim.`,
        ``,
        `📍 *Lacak Pesanan:*`,
        `${siteUrl}/track-order/${orderCode}`,
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
    `🔔 *PESANAN BARU!*`,
    ``,
    `• Kode: *${order.orderCode}*`,
    `• Nama: ${order.customerName}`,
    `• Telp: ${order.customerPhone}`,
    `• Total: *${formatRupiah(order.totalAmount)}*`,
    ``,
    `Silakan cek panel admin untuk detail selengkapnya.`,
  ].join("\n");
}

/**
 * Message sent to admin when payment proof is uploaded.
 */
export function paymentProofUploadedAdmin(
  orderCode: string,
  customerName: string,
): string {
  return [
    `💳 *BUKTI PEMBAYARAN DIUNGGAH*`,
    ``,
    `• Pesanan: *${orderCode}*`,
    `• Dari: ${customerName}`,
    ``,
    `Silakan lakukan verifikasi pembayaran di panel admin.`,
  ].join("\n");
}
