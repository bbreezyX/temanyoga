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

// ─── Brand tokens (email-safe) ───────────────────────────────────────────────
// Custom web fonts (Fraunces/Bungee/DM Sans) don't load in Gmail/Outlook/Yahoo,
// so we approximate the brand voice with system stacks: a warm serif for the
// wordmark + headings, a clean sans for body. Nothing is loaded remotely.
const INK = "#2d241c";
const BODY = "#3a3027";
const MUTED = "#6b5b4b";
const ACCENT = "#c85a2d"; // brand terracotta — large text only
const ACCENT_BTN = "#b5481f"; // deeper terracotta — clears 4.5:1 on white text
const CANVAS = "#ffffff";
const CREAM = "#f7f1e8";
const HAIRLINE = "#ece3d6";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function e(value: string): string {
  return escapeHtml(value);
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function emailWrapper(body: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>D'TEMAN YOGA</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${CANVAS};font-family:${SANS};color:${BODY};line-height:1.6;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${CANVAS};opacity:0">${e(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${CANVAS}" style="background-color:${CANVAS};border-collapse:collapse">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:collapse">
<tr><td style="padding:0 4px 16px;border-bottom:1px solid ${HAIRLINE}">
<span style="font-family:${SERIF};font-size:21px;font-weight:700;color:${ACCENT};letter-spacing:0.04em">D'TEMAN YOGA</span>
<span style="font-family:${SANS};font-size:12px;color:${MUTED};padding-left:10px">Teman Setia Yogamu</span>
</td></tr>
<tr><td style="padding:28px 4px">
${body}
</td></tr>
<tr><td style="padding:20px 4px 0;border-top:1px solid ${HAIRLINE}">
<p style="margin:0;font-family:${SANS};font-size:12px;font-weight:600;color:${MUTED}">D'TEMAN YOGA &mdash; Teman Setia Yogamu</p>
<p style="margin:6px 0 0;font-family:${SANS};font-size:11px;color:#9a8c7c">Email transaksional terkait pesanan Anda di <a href="https://${EMAIL_DOMAIN}" style="color:#9a8c7c">${EMAIL_DOMAIN}</a>.</p>
<p style="margin:4px 0 0;font-family:${SANS};font-size:11px;color:#9a8c7c">Butuh bantuan? Balas email ini atau hubungi cs@${EMAIL_DOMAIN}</p>
<p style="margin:4px 0 0;font-family:${SANS};font-size:11px;color:#9a8c7c">D'TEMAN YOGA &bull; Jambi, Indonesia</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 6px;font-family:${SANS};font-size:15px;color:${MUTED}">Halo <strong style="color:${INK}">${e(name)}</strong>,</p>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font-family:${SERIF};font-size:23px;line-height:1.3;font-weight:700;color:${INK}">${text}</h1>`;
}

function para(html: string): string {
  return `<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;line-height:1.65;color:${BODY}">${html}</p>`;
}

function signoff(line: string): string {
  return `<p style="margin:28px 0 0;font-family:${SANS};font-size:14px;color:${MUTED}">${line}<br><strong style="color:${INK}">Tim D'TEMAN YOGA</strong></p>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:26px 0;border-collapse:separate"><tr>
<td bgcolor="${ACCENT_BTN}" style="background-color:${ACCENT_BTN};border-radius:9999px">
<a href="${e(url)}" style="display:inline-block;padding:14px 30px;font-family:${SANS};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9999px">${e(label)} &rarr;</a>
</td></tr></table>`;
}

function infoPanel(
  label: string,
  valueHtml: string,
  opts: { size?: string; weight?: string; color?: string } = {},
): string {
  const { size = "15px", weight = "700", color = INK } = opts;
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border-collapse:separate"><tr>
<td style="background-color:${CREAM};border:1px solid ${HAIRLINE};border-radius:14px;padding:18px 20px">
<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED}">${label}</p>
<p style="margin:0;font-family:${SANS};font-size:${size};font-weight:${weight};line-height:1.45;color:${color}">${valueHtml}</p>
</td></tr></table>`;
}

// ─── Customer Emails ─────────────────────────────────────────────────────────

export function orderCreatedEmail(
  order: OrderData,
  siteUrl: string,
  bank?: BankData,
): EmailContent {
  const uploadUrl = `${siteUrl}/checkout/success/${order.orderCode}`;
  const bankName = bank?.bankName || "BCA";
  const accountNumber = bank?.accountNumber || "1234567890";
  const accountName = bank?.accountName || "D'TEMAN YOGA Studio";

  const body = `
${greeting(order.customerName)}
${heading("Pesanan kamu sudah kami terima")}
${para(`Terima kasih telah berbelanja. Pesanan <strong style="color:${INK}">${e(order.orderCode)}</strong> menunggu pembayaran. Selesaikan transfer lalu unggah buktinya untuk kami proses.`)}
${infoPanel("Total Tagihan", formatRupiah(order.totalAmount), { size: "27px", weight: "800", color: ACCENT })}
${infoPanel(
  "Transfer ke rekening",
  `<strong>Bank ${e(bankName)}</strong> &middot; ${e(accountNumber)}<br><span style="font-weight:400;color:${MUTED}">a/n ${e(accountName)}</span>`,
)}
${button(uploadUrl, "Unggah Bukti Pembayaran")}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan ${order.orderCode} — menunggu pembayaran`,
    html: emailWrapper(
      body,
      `Pesanan ${order.orderCode} menunggu pembayaran. Total ${formatRupiah(order.totalAmount)}.`,
    ),
    text: [
      `Halo ${order.customerName},`,
      ``,
      `Pesanan ${order.orderCode} telah kami terima.`,
      `Total: ${formatRupiah(order.totalAmount)}`,
      ``,
      `Transfer ke ${bankName} ${accountNumber} a/n ${accountName}`,
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
${greeting(customerName)}
${heading("Bukti pembayaran diterima")}
${para(`Kami sudah menerima bukti pembayaran untuk pesanan <strong style="color:${INK}">${e(orderCode)}</strong>. Tim kami akan memverifikasinya dalam waktu maksimal 1&times;24 jam.`)}
${button(trackUrl, "Lacak Pesanan")}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Bukti pembayaran diterima — ${orderCode}`,
    html: emailWrapper(
      body,
      `Bukti pembayaran ${orderCode} sedang kami verifikasi (maks. 1x24 jam).`,
    ),
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
${greeting(customerName)}
${heading("Pembayaran terverifikasi")}
${para(`Pembayaran untuk pesanan <strong style="color:${INK}">${e(orderCode)}</strong> berhasil kami verifikasi. Pesanan kamu kini sedang kami siapkan untuk pengiriman.`)}
${button(trackUrl, "Lacak Pesanan")}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Pembayaran terverifikasi — ${orderCode}`,
    html: emailWrapper(
      body,
      `Pembayaran ${orderCode} terverifikasi. Pesanan sedang disiapkan.`,
    ),
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
  const reasonPanel = reason
    ? `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border-collapse:separate"><tr>
<td style="background-color:#fbeee7;border:1px solid #f0d4c4;border-radius:14px;padding:18px 20px">
<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${ACCENT_BTN}">Alasan</p>
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.5;color:${INK}">${e(reason)}</p>
</td></tr></table>`
    : "";
  const body = `
${greeting(customerName)}
${heading("Bukti pembayaran perlu diperbarui")}
${para(`Mohon maaf, bukti pembayaran untuk pesanan <strong style="color:${INK}">${e(orderCode)}</strong> belum dapat kami verifikasi. Silakan unggah ulang bukti yang valid.`)}
${reasonPanel}
${button(uploadUrl, "Unggah Ulang Bukti Pembayaran")}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Bukti pembayaran perlu diperbarui — ${orderCode}`,
    html: emailWrapper(
      body,
      `Bukti pembayaran ${orderCode} perlu diunggah ulang.`,
    ),
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
${greeting(customerName)}
${heading("Pesanan kamu sedang dalam perjalanan")}
${para(`Kabar baik! Pesanan <strong style="color:${INK}">${e(orderCode)}</strong> telah kami kirim.`)}
${infoPanel("Kurir / No. Resi", `${e(tracking.courier)} &middot; ${e(tracking.trackingNumber)}`, { size: "16px" })}
${button(trackUrl, "Lacak Pengiriman")}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan dikirim — ${orderCode}`,
    html: emailWrapper(
      body,
      `Pesanan ${orderCode} dikirim via ${tracking.courier} — resi ${tracking.trackingNumber}.`,
    ),
    text: `Halo ${customerName}, pesanan ${orderCode} dikirim via ${tracking.courier}, resi ${tracking.trackingNumber}.\n\nLacak: ${trackUrl}`,
  };
}

export function orderCompletedEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
${greeting(customerName)}
${heading("Pesanan selesai")}
${para(`Pesanan <strong style="color:${INK}">${e(orderCode)}</strong> telah selesai. Semoga produk kami menemani perjalanan yoga kamu dengan baik.`)}
${signoff("Sampai jumpa di pesanan berikutnya,")}`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan selesai — ${orderCode}`,
    html: emailWrapper(body, `Pesanan ${orderCode} telah selesai. Terima kasih!`),
    text: `Halo ${customerName}, pesanan ${orderCode} telah selesai. Terima kasih telah berbelanja di D'TEMAN YOGA!`,
  };
}

export function orderCancelledEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
${greeting(customerName)}
${heading("Pesanan dibatalkan")}
${para(`Pesanan <strong style="color:${INK}">${e(orderCode)}</strong> telah dibatalkan. Jika kamu tidak merasa melakukan pembatalan, silakan balas email ini agar tim kami bisa membantu.`)}
${signoff("Terima kasih,")}`;

  return {
    subject: `[D'TEMAN YOGA] Pesanan dibatalkan — ${orderCode}`,
    html: emailWrapper(body, `Pesanan ${orderCode} telah dibatalkan.`),
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
          `${greeting(customerName)}
${heading("Pesanan kamu sedang dalam perjalanan")}
${para(`Pesanan <strong style="color:${INK}">${e(orderCode)}</strong> telah kami kirim.`)}
${button(`${siteUrl}/track-order/${orderCode}`, "Lacak Pesanan")}
${signoff("Terima kasih,")}`,
          `Pesanan ${orderCode} telah dikirim.`,
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
