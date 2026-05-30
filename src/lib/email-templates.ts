import type { OrderStatus } from "@/generated/prisma/client";
import { escapeHtml } from "@/lib/sanitize";
import { EMAIL_DOMAIN } from "@/lib/email-config";

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

function e(value: string): string {
  return escapeHtml(value);
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
<p style="margin:4px 0 0;color:#9ca3af;font-size:11px">Email transaksional terkait pesanan Anda di <a href="https://${EMAIL_DOMAIN}" style="color:#9ca3af">${EMAIL_DOMAIN}</a>.</p>
<p style="margin:4px 0 0;color:#9ca3af;font-size:11px">Butuh bantuan? Balas email ini atau hubungi cs@${EMAIL_DOMAIN}</p>
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
<a href="${e(url)}" style="color:#c85a2d;font-weight:700;text-decoration:underline;font-size:15px">${e(label)} &rarr;</a>
</div>`;
}

// ─── Customer Emails ─────────────────────────────────────────────────────────

export function orderCreatedEmail(
  order: OrderData,
  siteUrl: string,
  bank?: BankData,
): EmailContent {
  const uploadUrl = `${siteUrl}/checkout/success/${order.orderCode}`;
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(order.customerName)}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Terima kasih telah berbelanja. Pesanan Anda <strong>${e(order.orderCode)}</strong> telah kami terima dan menunggu pembayaran.</p>

<div style="background-color:#f9fafb;padding:20px;border-radius:8px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">Total Tagihan:</p>
<p style="margin:0;font-size:24px;font-weight:800;color:#111827">${formatRupiah(order.totalAmount)}</p>
</div>

<p style="margin:0 0 12px;font-size:15px;font-weight:700">Silakan transfer ke rekening:</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6">
<strong>Bank ${e(bank?.bankName || "BCA")}</strong>: ${e(bank?.accountNumber || "1234567890")}<br>
a/n ${e(bank?.accountName || "D'TEMAN YOGA Studio")}
</p>

<p style="margin:0 0 8px;font-size:15px">Konfirmasi pembayaran Anda di sini:</p>
${linkButton(uploadUrl, "Unggah Bukti Pembayaran")}

<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan ${order.orderCode} — menunggu pembayaran`,
    html: emailWrapper(body),
    text: [
      `Halo ${order.customerName},`,
      ``,
      `Pesanan ${order.orderCode} telah kami terima.`,
      `Total: ${formatRupiah(order.totalAmount)}`,
      ``,
      `Transfer ke ${bank?.bankName || "BCA"} ${bank?.accountNumber || "1234567890"} a/n ${bank?.accountName || "D'TEMAN YOGA Studio"}`,
      ``,
      `Unggah bukti pembayaran: ${uploadUrl}`,
      ``,
      `Tim D'TEMAN YOGA`,
    ].join("\n"),
  };
}

export function paymentProofReceivedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const trackUrl = `${siteUrl}/track-order/${orderCode}`;
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Kami telah menerima bukti pembayaran untuk pesanan <strong>${e(orderCode)}</strong>. Tim kami akan segera melakukan verifikasi dalam waktu maksimal 1x24 jam.</p>
${linkButton(trackUrl, "Lacak Pesanan")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Bukti pembayaran diterima — ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, bukti pembayaran untuk ${orderCode} telah kami terima.\n\nLacak pesanan: ${trackUrl}`,
  };
}

export function paymentApprovedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const trackUrl = `${siteUrl}/track-order/${orderCode}`;
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Pembayaran Anda untuk pesanan <strong>${e(orderCode)}</strong> telah berhasil diverifikasi. Pesanan Anda kini sedang kami siapkan untuk pengiriman.</p>
${linkButton(trackUrl, "Lacak Pesanan")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Pembayaran terverifikasi — ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pembayaran untuk ${orderCode} telah diverifikasi.\n\nLacak pesanan: ${trackUrl}`,
  };
}

export function paymentRejectedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string,
): EmailContent {
  const uploadUrl = `${siteUrl}/checkout/success/${orderCode}`;
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Mohon maaf, bukti pembayaran untuk pesanan <strong>${e(orderCode)}</strong> tidak dapat kami verifikasi.</p>
${reason ? `<p style="margin:0 0 16px;padding:12px;background-color:#fff1f2;color:#e11d48;border-radius:4px;font-size:14px"><strong>Alasan:</strong> ${e(reason)}</p>` : ""}
<p style="margin:0 0 8px;font-size:15px">Silakan unggah kembali bukti pembayaran yang valid:</p>
${linkButton(uploadUrl, "Unggah Ulang Bukti Pembayaran")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Bukti pembayaran perlu diperbarui — ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, bukti pembayaran untuk ${orderCode} ditolak.${reason ? ` Alasan: ${reason}.` : ""}\n\nUnggah ulang: ${uploadUrl}`,
  };
}

export function orderShippedEmail(
  orderCode: string,
  customerName: string,
  tracking: TrackingData,
  siteUrl: string,
): EmailContent {
  const trackUrl = `${siteUrl}/track-order/${orderCode}`;
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px">Pesanan <strong>${e(orderCode)}</strong> telah dikirim!</p>

<div style="border:1px solid #f3f4f6;padding:16px;border-radius:8px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">Kurir / No. Resi:</p>
<p style="margin:0;font-size:16px;font-weight:700">${e(tracking.courier)} &mdash; ${e(tracking.trackingNumber)}</p>
</div>

${linkButton(trackUrl, "Lacak Pengiriman")}
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan dikirim — ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pesanan ${orderCode} dikirim via ${tracking.courier}, resi ${tracking.trackingNumber}.\n\nLacak: ${trackUrl}`,
  };
}

export function orderCompletedEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Pesanan <strong>${e(orderCode)}</strong> Anda telah selesai. Kami harap produk kami dapat menemani perjalanan yoga Anda dengan baik.</p>
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Sampai jumpa di pesanan berikutnya,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan selesai — ${orderCode}`,
    html: emailWrapper(body),
    text: `Halo ${customerName}, pesanan ${orderCode} telah selesai. Terima kasih telah berbelanja di D'TEMAN YOGA!`,
  };
}

export function orderCancelledEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<p style="margin:0 0 16px;font-size:16px">Halo <strong>${e(customerName)}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px">Informasi bahwa pesanan <strong>${e(orderCode)}</strong> telah dibatalkan. Jika Anda tidak merasa melakukan pembatalan, silakan hubungi tim kami.</p>
<p style="margin:24px 0 0;font-size:14px;color:#6b7280">Terima kasih,<br>Tim D'TEMAN YOGA</p>`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan dibatalkan — ${orderCode}`,
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
        subject: `[D'TEMAN YOGA] Pesanan dikirim — ${orderCode}`,
        html: emailWrapper(
          `<p style="margin:0 0 24px;font-size:15px">Pesanan <strong>${e(orderCode)}</strong> telah dikirim.</p>${linkButton(`${siteUrl}/track-order/${orderCode}`, "Lacak Pesanan")}`,
        ),
        text: `Halo ${customerName}, pesanan ${orderCode} telah dikirim.\n\nLacak: ${siteUrl}/track-order/${orderCode}`,
      };
    case "COMPLETED":
      return orderCompletedEmail(orderCode, customerName);
    case "CANCELLED":
      return orderCancelledEmail(orderCode, customerName);
    default:
      return null;
  }
}
