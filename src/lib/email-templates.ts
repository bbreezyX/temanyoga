import type { OrderStatus } from "@prisma/client";

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

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>D'TEMAN YOGA</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;line-height:1.6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:40px 20px">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">
<tr><td style="padding-bottom:24px;border-bottom:1px solid #f3f4f6">
<h1 style="margin:0;color:#c85a2d;font-size:18px;font-weight:700;letter-spacing:-0.01em">D'TEMAN YOGA</h1>
</td></tr>
<tr><td style="padding:32px 0">
${body}
</td></tr>
<tr><td style="padding-top:32px;border-top:1px solid #f3f4f6">
<p style="margin:0;color:#6b7280;font-size:12px;font-weight:500">D'TEMAN YOGA &mdash; Teman Setia Yogamu</p>
<p style="margin:4px 0 0;color:#9ca3af;font-size:11px">Anda menerima email ini karena melakukan pemesanan di ditemaniyoga.com.</p>
<p style="margin:4px 0 0;color:#9ca3af;font-size:11px">D'TEMAN YOGA &bull; Jambi, Indonesia</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function linkButton(url: string, label: string): string {
  return `<div style="margin:24px 0">
<a href="${url}" style="color:#c85a2d;font-weight:700;text-decoration:underline;font-size:15px">${label} &rarr;</a>
</div>`;
}

// ─── Customer Emails ─────────────────────────────────────────────────────────

export function orderCreatedEmail(
  order: OrderData,
  siteUrl: string,
  bank?: BankData,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${order.customerName}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Terima kasih telah berbelanja. Pesanan Anda <strong>${order.orderCode}</strong> telah kami terima dan menunggu pembayaran.</p>

<div style="background-color:#f9fafb;padding:20px;border-radius:8px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">Total Tagihan:</p>
<p style="margin:0;font-size:24px;font-weight:800;color:#111827">${formatRupiah(order.totalAmount)}</p>
</div>

<p style="margin:0 0 12px;font-size:15px;font-weight:700">Silakan transfer ke rekening:</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6">
<strong>Bank ${bank?.bankName || "BCA"}</strong>: ${bank?.accountNumber || "1234567890"}<br>
a/n ${bank?.accountName || "D'TEMAN YOGA Studio"}
</p>

<p style="margin:0 0 8px;font-size:15px">Konfirmasi pembayaran Anda di sini:</p>
${linkButton(`${siteUrl}/checkout/success/${order.orderCode}`, "Unggah Bukti Pembayaran")}

<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Pesanan Baru ${order.orderCode} - D'TEMAN YOGA`,
    html: emailWrapper(body),
    text: `Halo ${order.customerName}, pesanan Anda ${order.orderCode} berhasil dibuat. Total: ${formatRupiah(order.totalAmount)}. Silakan transfer ke ${bank?.bankName || "BCA"} ${bank?.accountNumber || "1234567890"} a/n ${bank?.accountName || "D'TEMAN YOGA Studio"}.`,
  };
}

export function paymentProofReceivedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Kami telah menerima bukti pembayaran untuk pesanan <strong>${orderCode}</strong>. Tim kami akan segera melakukan verifikasi dalam waktu maksimal 1x24 jam.</p>
${linkButton(`${siteUrl}/track-order/${orderCode}`, "Lacak Pesanan")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Bukti Pembayaran Diterima - ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, bukti pembayaran untuk ${orderCode} telah kami terima dan sedang dalam proses verifikasi.`,
  };
}

export function paymentApprovedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Pembayaran Anda untuk pesanan <strong>${orderCode}</strong> telah berhasil diverifikasi. Pesanan Anda kini sedang kami siapkan untuk pengiriman.</p>
${linkButton(`${siteUrl}/track-order/${orderCode}`, "Lacak Pesanan")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Pembayaran Berhasil Diverifikasi - ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pembayaran untuk ${orderCode} telah berhasil diverifikasi. Pesanan Anda sedang diproses.`,
  };
}

export function paymentRejectedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Mohon maaf, bukti pembayaran untuk pesanan <strong>${orderCode}</strong> tidak dapat kami verifikasi.</p>
${reason ? `<p style="margin:0 0 16px;padding:12px;background-color:#fff1f2;color:#e11d48;border-radius:4px;font-size:14px"><strong>Alasan:</strong> ${reason}</p>` : ""}
<p style="margin:0 0 8px;font-size:15px">Silakan unggah kembali bukti pembayaran yang valid:</p>
${linkButton(`${siteUrl}/checkout/success/${orderCode}`, "Unggah Ulang Bukti Pembayaran")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Perhatian: Pembayaran Perlu Diperbarui - ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pembayaran untuk ${orderCode} ditolak. Alasan: ${reason || "Bukti tidak valid"}. Mohon unggah ulang bukti pembayaran.`,
  };
}

export function orderShippedEmail(
  orderCode: string,
  customerName: string,
  tracking: TrackingData,
  siteUrl: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Pesanan <strong>${orderCode}</strong> telah dikirim!</p>

<div style="border:1px solid #f3f4f6;padding:16px;border-radius:8px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">Kurir / No. Resi:</p>
<p style="margin:0;font-size:16px;font-weight:700">${tracking.courier} &mdash; ${tracking.trackingNumber}</p>
</div>

${linkButton(`${siteUrl}/track-order/${orderCode}`, "Lacak Pengiriman")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Pesanan Anda Telah Dikirim - ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pesanan ${orderCode} telah dikirim via ${tracking.courier} dengan resi ${tracking.trackingNumber}.`,
  };
}

export function orderCompletedEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Pesanan <strong>${orderCode}</strong> Anda telah selesai. Kami harap produk kami dapat menemani perjalanan yoga Anda dengan baik.</p>
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Sampai jumpa di pesanan berikutnya,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Pesanan Selesai - Terima kasih! ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pesanan ${orderCode} telah selesai. Terima kasih telah berbelanja di D'TEMAN YOGA!`,
  };
}

export function orderCancelledEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${customerName}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Informasi bahwa pesanan <strong>${orderCode}</strong> telah dibatalkan. Jika Anda tidak merasa melakukan pembatalan, silakan hubungi tim kami.</p>
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `Informasi Pembatalan Pesanan - ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pesanan ${orderCode} telah dibatalkan. Hubungi kami jika Anda memiliki pertanyaan.`,
  };
}

/**
 * Get the appropriate email content for a status change.
 */
export function getStatusChangeEmail(
  status: OrderStatus,
  orderCode: string,
  customerName: string,
  siteUrl: string,
  tracking?: TrackingData | null,
): EmailContent | null {
  switch (status) {
    case "SHIPPED":
      if (tracking?.courier && tracking?.trackingNumber) {
        return orderShippedEmail(orderCode, customerName, tracking, siteUrl);
      }
      return {
        subject: `Pesanan Dikirim - ${orderCode}`,
        html: emailWrapper(
          `<p style="margin:0 0 24px;font-size:15px">Pesanan <strong>${orderCode}</strong> telah dikirim.</p>${linkButton(`${siteUrl}/track-order/${orderCode}`, "Lacak Pesanan")}`,
        ),
        text: `Halo ${customerName}, pesanan ${orderCode} telah dikirim.`,
      };
    case "COMPLETED":
      return orderCompletedEmail(orderCode, customerName);
    case "CANCELLED":
      return orderCancelledEmail(orderCode, customerName);
    default:
      return null;
  }
}
