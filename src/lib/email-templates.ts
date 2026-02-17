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
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#3f3328">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e8dcc8;border-radius:16px;overflow:hidden">
<tr><td style="background-color:#f5f1ed;padding:32px;text-align:center;border-bottom:1px solid #e8dcc8">
<h1 style="margin:0;color:#c85a2d;font-size:24px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase">D'TEMAN YOGA</h1>
<p style="margin:4px 0 0;color:#6b5b4b;font-size:13px;letter-spacing:1px">TEMAN SETIA YOGAMU</p>
</td></tr>
<tr><td style="padding:40px 32px">
${body}
</td></tr>
<tr><td style="padding:24px 32px;background-color:#f5f1ed;text-align:center;border-top:1px solid #e8dcc8">
<p style="margin:0;color:#6b5b4b;font-size:12px;font-weight:500">&copy; ${new Date().getFullYear()} D'TEMAN YOGA. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td>
<a href="${url}" style="display:inline-block;padding:14px 32px;background-color:#c85a2d;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.5px">${label}</a>
</td></tr></table>`;
}

// ─── Customer Emails ─────────────────────────────────────────────────────────

export function orderCreatedEmail(
  order: OrderData,
  siteUrl: string,
  bank?: BankData,
): EmailContent {
  let amountRows = "";
  if (order.discountAmount > 0) {
    amountRows += `<tr><td style="padding:8px 0;color:#6b5b4b">Diskon</td><td style="padding:8px 0;text-align:right;color:#c85a2d;font-weight:600">-${formatRupiah(order.discountAmount)}</td></tr>`;
  }
  if (order.shippingCost > 0) {
    amountRows += `<tr><td style="padding:8px 0;color:#6b5b4b">Ongkir</td><td style="padding:8px 0;text-align:right;color:#3f3328;font-weight:600">${formatRupiah(order.shippingCost)}</td></tr>`;
  }

  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${order.customerName}!</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Pesanan Anda telah berhasil dibuat. Silakan lakukan pembayaran agar pesanan Anda dapat segera kami proses.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ed;border-radius:12px;padding:20px;margin-bottom:32px;border:1px solid #e8dcc8">
<tr><td style="padding:8px 0;color:#6b5b4b">Kode Pesanan</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#3f3328">${order.orderCode}</td></tr>
${amountRows}
<tr><td style="padding:12px 0 0;color:#3f3328;font-weight:700;border-top:1px solid #e8dcc8;font-size:18px">Total Pembayaran</td><td style="padding:12px 0 0;text-align:right;font-weight:800;color:#c85a2d;border-top:1px solid #e8dcc8;font-size:18px">${formatRupiah(order.totalAmount)}</td></tr>
</table>

<p style="margin:0 0 16px;color:#3f3328;font-size:16px;font-weight:700">Metode Pembayaran:</p>

<div style="margin-bottom:24px">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e8dcc8;border-radius:12px;padding:16px;margin-bottom:12px">
<tr><td>
<span style="color:#6b5b4b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Bank ${bank?.bankName || "BCA"}</span><br>
<strong style="color:#3f3328;font-size:18px">${bank?.accountNumber || "1234567890"}</strong><br>
<span style="color:#6b5b4b;font-size:14px">a/n ${bank?.accountName || "D'TEMAN YOGA Studio"}</span>
</td></tr>
</table>
</div>

<p style="margin:0;color:#6b5b4b;font-size:15px;line-height:1.5">Setelah melakukan transfer, mohon unggah bukti pembayaran melalui tautan di bawah ini:</p>
${button(`${siteUrl}/checkout/success?code=${order.orderCode}`, "Unggah Bukti Pembayaran")}

<p style="margin:32px 0 0;color:#6b5b4b;font-size:14px;text-align:center;font-style:italic">Terima kasih telah mempercayakan kebutuhan yoga Anda kepada D'TEMAN YOGA.</p>`;

  return {
    subject: `Konfirmasi Pesanan ${order.orderCode} - D'TEMAN YOGA`,
    html: emailWrapper(body),
  };
}

export function paymentProofReceivedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName}!</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Bukti pembayaran untuk pesanan <strong>${orderCode}</strong> telah kami terima. Tim kami akan segera melakukan verifikasi pembayaran Anda.</p>
<p style="margin:0 0 8px;color:#6b5b4b;font-size:15px">Anda dapat memantau status pesanan Anda melalui tautan di bawah ini:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Status Pesanan")}
<p style="margin:24px 0 0;color:#6b5b4b;font-size:14px;line-height:1.5">Kami akan mengirimkan email notifikasi selanjutnya setelah pembayaran berhasil diverifikasi.</p>`;

  return {
    subject: `Bukti Pembayaran Diterima - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function paymentApprovedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
): EmailContent {
  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName}!</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Kabar baik! Pembayaran untuk pesanan <strong>${orderCode}</strong> telah berhasil diverifikasi. Pesanan Anda kini masuk ke tahap pemrosesan.</p>
<p style="margin:0 0 8px;color:#6b5b4b;font-size:15px">Pantau terus perkembangan pesanan Anda di sini:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pesanan")}
<p style="margin:24px 0 0;color:#6b5b4b;font-size:14px">Terima kasih telah berbelanja di D'TEMAN YOGA!</p>`;

  return {
    subject: `Pembayaran Berhasil Diverifikasi - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function paymentRejectedEmail(
  orderCode: string,
  customerName: string,
  siteUrl: string,
  reason?: string,
): EmailContent {
  const reasonBlock = reason
    ? `<div style="margin:0 0 24px;background-color:#fff1f2;border:1px solid #fecaca;border-radius:12px;padding:16px">
         <strong style="color:#e11d48;display:block;margin-bottom:4px;font-size:14px">Alasan Penolakan:</strong>
         <p style="margin:0;color:#9f1239;font-size:15px;line-height:1.5">${reason}</p>
       </div>`
    : "";

  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName},</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Mohon maaf, bukti pembayaran untuk pesanan <strong>${orderCode}</strong> tidak dapat kami verifikasi.</p>
${reasonBlock}
<p style="margin:0 0 8px;color:#6b5b4b;font-size:15px">Silakan unggah kembali bukti pembayaran yang valid agar pesanan Anda dapat segera kami proses:</p>
${button(`${siteUrl}/checkout/success?code=${orderCode}`, "Unggah Ulang Bukti Pembayaran")}
<p style="margin:24px 0 0;color:#6b5b4b;font-size:14px">Jika Anda butuh bantuan, silakan hubungi tim dukungan kami.</p>`;

  return {
    subject: `Perhatian: Pembayaran Perlu Diperbarui - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderShippedEmail(
  orderCode: string,
  customerName: string,
  tracking: TrackingData,
  siteUrl: string,
): EmailContent {
  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName}!</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Pesanan <strong>${orderCode}</strong> Anda telah dikirim dan sedang dalam perjalanan menuju lokasi Anda.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ed;border-radius:12px;padding:20px;margin-bottom:32px;border:1px solid #e8dcc8">
<tr><td style="padding:4px 0;color:#6b5b4b">Kurir</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#3f3328">${tracking.courier}</td></tr>
<tr><td style="padding:4px 0;color:#6b5b4b">Nomor Resi</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#c85a2d">${tracking.trackingNumber}</td></tr>
</table>

<p style="margin:0 0 8px;color:#6b5b4b;font-size:15px">Gunakan nomor resi di atas untuk melacak pesanan Anda:</p>
${button(`${siteUrl}/track-order?code=${orderCode}`, "Lacak Pengiriman")}
<p style="margin:24px 0 0;color:#6b5b4b;font-size:14px">Semoga produk kami segera sampai dengan selamat!</p>`;

  return {
    subject: `Pesanan Anda Telah Dikirim - ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderCompletedEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName}!</h2>
<p style="margin:0 0 16px;color:#6b5b4b;font-size:16px;line-height:1.5">Pesanan <strong>${orderCode}</strong> Anda telah selesai.</p>
<p style="margin:0;color:#6b5b4b;font-size:16px;line-height:1.5">Terima kasih banyak telah berbelanja di D'TEMAN YOGA! Kami harap Anda menyukai produk kami dan dapat menemani aktivitas yoga Anda dengan baik.</p>
<p style="margin:24px 0 0;color:#6b5b4b;font-size:14px">Sampai jumpa di pesanan berikutnya!</p>`;

  return {
    subject: `Pesanan Selesai - Terima kasih! ${orderCode}`,
    html: emailWrapper(body),
  };
}

export function orderCancelledEmail(
  orderCode: string,
  customerName: string,
): EmailContent {
  const body = `
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName},</h2>
<p style="margin:0 0 16px;color:#6b5b4b;font-size:16px;line-height:1.5">Pesanan <strong>${orderCode}</strong> telah dibatalkan.</p>
<p style="margin:0;color:#6b5b4b;font-size:16px;line-height:1.5">Jika Anda merasa ini adalah kesalahan atau memiliki pertanyaan mengenai pembatalan ini, jangan ragu untuk menghubungi kami.</p>`;

  return {
    subject: `Informasi Pembatalan Pesanan - ${orderCode}`,
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
  tracking?: TrackingData | null,
): EmailContent | null {
  switch (status) {
    case "SHIPPED":
      if (tracking?.courier && tracking?.trackingNumber) {
        return orderShippedEmail(orderCode, customerName, tracking, siteUrl);
      }
      return {
        subject: `Pesanan Dikirim - ${orderCode}`,
        html: emailWrapper(`
<h2 style="margin:0 0 16px;color:#3f3328;font-size:20px;font-weight:700">Halo ${customerName}!</h2>
<p style="margin:0 0 24px;color:#6b5b4b;font-size:16px;line-height:1.5">Pesanan <strong>${orderCode}</strong> telah dikirim.</p>
<p style="margin:0 0 8px;color:#6b5b4b;font-size:15px">Lacak pesanan Anda:</p>
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
