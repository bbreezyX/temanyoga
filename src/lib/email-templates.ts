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

type EmailContent = {
  subject: string;
  html: string;
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<tr><td style="background-color:#16a34a;padding:24px 32px;text-align:center">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px">Temanyoga</h1>
</td></tr>
<tr><td style="padding:32px">
${body}
</td></tr>
<tr><td style="padding:16px 32px;background-color:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
<p style="margin:0;color:#9ca3af;font-size:12px">Temanyoga &mdash; Teman Setia Yogamu</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td>
<a href="${url}" style="display:inline-block;padding:12px 28px;background-color:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">${label}</a>
</td></tr></table>`;
}

// ─── Customer Emails ─────────────────────────────────────────────────────────

export function orderCreatedEmail(
  order: OrderData,
  siteUrl: string
): EmailContent {
  let amountRows = "";
  if (order.discountAmount > 0) {
    amountRows += `<tr><td style="padding:4px 0;color:#6b7280">Diskon</td><td style="padding:4px 0;text-align:right;color:#16a34a">-${formatRupiah(order.discountAmount)}</td></tr>`;
  }
  if (order.shippingCost > 0) {
    amountRows += `<tr><td style="padding:4px 0;color:#6b7280">Ongkir</td><td style="padding:4px 0;text-align:right">${formatRupiah(order.shippingCost)}</td></tr>`;
  }

  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${order.customerName}</strong>!</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px">Pesanan Anda telah berhasil dibuat.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
<tr><td style="padding:4px 0;color:#6b7280">Kode Pesanan</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827">${order.orderCode}</td></tr>
<tr><td style="padding:4px 0;color:#6b7280">Total</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827">${formatRupiah(order.totalAmount)}</td></tr>
${amountRows}
</table>

<p style="margin:0 0 12px;color:#374151;font-size:15px;font-weight:600">Silakan transfer ke salah satu rekening berikut:</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px">
<tr><td><strong style="color:#166534">Bank BCA</strong><br><span style="color:#374151">No. Rek: 1234567890</span><br><span style="color:#6b7280">a/n TemanYoga Studio</span></td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
<tr><td><strong style="color:#166534">Bank Mandiri</strong><br><span style="color:#374151">No. Rek: 0987654321</span><br><span style="color:#6b7280">a/n TemanYoga Studio</span></td></tr>
</table>

<p style="margin:0 0 8px;color:#374151;font-size:15px">Setelah transfer, upload bukti pembayaran:</p>
${button(`${siteUrl}/checkout/success?code=${order.orderCode}`, "Upload Bukti Pembayaran")}

<p style="margin:0 0 8px;color:#374151;font-size:15px">Lacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${order.orderCode}`, "Lacak Pesanan")}

<p style="margin:0;color:#6b7280;font-size:14px">Terima kasih telah berbelanja di Temanyoga!</p>`;

  return {
    subject: `Konfirmasi Pesanan ${order.orderCode} - Temanyoga`,
    html: emailWrapper(body),
  };
}

export function paymentProofReceivedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string
): EmailContent {
  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>!</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px">Bukti pembayaran untuk pesanan <strong>${orderCode}</strong> telah kami terima dan sedang dalam proses verifikasi.</p>
<p style="margin:0 0 8px;color:#374151;font-size:15px">Lacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pesanan")}
<p style="margin:0;color:#6b7280;font-size:14px">Kami akan mengabari Anda setelah pembayaran diverifikasi.</p>`;

  return {
    subject: `Bukti Pembayaran Diterima - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function paymentApprovedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string
): EmailContent {
  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>!</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px">Pembayaran untuk pesanan <strong>${orderCode}</strong> telah diverifikasi. Pesanan Anda sedang diproses.</p>
<p style="margin:0 0 8px;color:#374151;font-size:15px">Lacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pesanan")}
<p style="margin:0;color:#6b7280;font-size:14px">Terima kasih!</p>`;

  return {
    subject: `Pembayaran Diverifikasi - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function paymentRejectedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string
): EmailContent {
  const reasonBlock = reason
    ? `<p style="margin:0 0 16px;color:#dc2626;font-size:14px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px">Alasan: ${reason}</p>`
    : "";

  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px">Mohon maaf, bukti pembayaran untuk pesanan <strong>${orderCode}</strong> tidak dapat diverifikasi.</p>
${reasonBlock}
<p style="margin:0 0 8px;color:#374151;font-size:15px">Silakan upload ulang bukti pembayaran:</p>
${button(`${siteUrl}/checkout/success?code=${orderCode}`, "Upload Ulang")}
<p style="margin:0;color:#6b7280;font-size:14px">Jika ada pertanyaan, silakan hubungi kami.</p>`;

  return {
    subject: `Pembayaran Perlu Diperbarui - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderShippedEmail(
  orderCode: string,
  customerName: string,
  tracking: TrackingData,
  siteUrl: string
): EmailContent {
  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>!</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px">Pesanan <strong>${orderCode}</strong> telah dikirim.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
<tr><td style="padding:4px 0;color:#6b7280">Kurir</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827">${tracking.courier}</td></tr>
<tr><td style="padding:4px 0;color:#6b7280">No. Resi</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827">${tracking.trackingNumber}</td></tr>
</table>

<p style="margin:0 0 8px;color:#374151;font-size:15px">Lacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pesanan")}
<p style="margin:0;color:#6b7280;font-size:14px">Terima kasih telah berbelanja di Temanyoga!</p>`;

  return {
    subject: `Pesanan Dikirim - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderCompletedEmail(
  orderCode: string,
  customerName: string
): EmailContent {
  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>!</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px">Pesanan <strong>${orderCode}</strong> telah selesai.</p>
<p style="margin:0;color:#374151;font-size:15px">Terima kasih telah berbelanja di Temanyoga! Kami harap Anda puas dengan produk kami.</p>`;

  return {
    subject: `Pesanan Selesai - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderCancelledEmail(
  orderCode: string,
  customerName: string
): EmailContent {
  const body = `
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px">Pesanan <strong>${orderCode}</strong> telah dibatalkan.</p>
<p style="margin:0;color:#6b7280;font-size:14px">Jika Anda merasa ini adalah kesalahan atau memiliki pertanyaan, silakan hubungi kami.</p>`;

  return {
    subject: `Pesanan Dibatalkan - ${orderCode}`,
    html: emailWrapper(body),
  };
}

/**
 * Get the appropriate email content for a status change.
 * Returns null if no email should be sent for this status.
 */
export function getStatusChangeEmail(
  status: OrderStatus,
  orderCode: string,
  customerName: string,
  siteUrl: string,
  tracking?: TrackingData | null
): EmailContent | null {
  switch (status) {
    case "SHIPPED":
      if (tracking?.courier && tracking?.trackingNumber) {
        return orderShippedEmail(orderCode, customerName, tracking, siteUrl);
      }
      return {
        subject: `Pesanan Dikirim - ${orderCode}`,
        html: emailWrapper(`
<p style="margin:0 0 16px;color:#374151;font-size:15px">Halo <strong>${customerName}</strong>!</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px">Pesanan <strong>${orderCode}</strong> telah dikirim.</p>
<p style="margin:0 0 8px;color:#374151;font-size:15px">Lacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pesanan")}`),
      };
    case "COMPLETED":
      return orderCompletedEmail(orderCode, customerName);
    case "CANCELLED":
      return orderCancelledEmail(orderCode, customerName);
    default:
      return null;
  }
}
