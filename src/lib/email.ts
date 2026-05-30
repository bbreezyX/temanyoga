import { Resend } from "resend";
import { getSiteSetting } from "@/lib/whatsapp";
import {
  DEFAULT_EMAIL_FROM,
  DEFAULT_EMAIL_REPLY_TO,
  EMAIL_DOMAIN,
  normalizeEmailSetting,
} from "@/lib/email-config";

type SendResult = {
  success: boolean;
  detail?: string;
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

async function getFromAddress(): Promise<string> {
  const raw = (await getSiteSetting("email_from")) || DEFAULT_EMAIL_FROM;
  return normalizeEmailSetting(raw);
}

async function getReplyToAddress(): Promise<string> {
  const raw =
    (await getSiteSetting("email_reply_to")) || DEFAULT_EMAIL_REPLY_TO;
  return normalizeEmailSetting(raw);
}

/**
 * Check if email notifications are enabled.
 * Requires both RESEND_API_KEY env var and email_enabled setting.
 */
async function isEmailEnabled(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const enabled = await getSiteSetting("email_enabled");
  return enabled === "true";
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    return { success: false, detail: "RESEND_API_KEY belum dikonfigurasi" };
  }

  const from = await getFromAddress();
  const replyTo = await getReplyToAddress();

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text || undefined,
    tags: [{ name: "category", value: "transactional" }],
    headers: {
      "X-Entity-Ref-ID": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      "List-Id": `orders.${EMAIL_DOMAIN}`,
      "X-Auto-Response-Suppress": "All",
    },
  });

  if (error) {
    console.error("Resend API error:", error);
    return { success: false, detail: error.message };
  }

  return { success: true };
}

/**
 * Send an email to a customer.
 * Checks if email is enabled before sending.
 * Safe to call without await — will not throw.
 */
export async function sendEmailToCustomer(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<SendResult> {
  try {
    const enabled = await isEmailEnabled();
    if (!enabled) {
      return { success: false, detail: "Email notifications disabled" };
    }

    return await sendEmail({ to, subject, html, text });
  } catch (error) {
    console.error("sendEmailToCustomer error:", error);
    return { success: false, detail: "Internal error" };
  }
}

/** Admin test send — ignores email_enabled toggle. */
export async function sendEmailTest(to: string): Promise<SendResult> {
  try {
    const html = `<!DOCTYPE html>
<html lang="id">
<body style="font-family:sans-serif;color:#2d241c;line-height:1.6;padding:24px">
  <h1 style="color:#c85a2d;font-size:20px">D'TEMAN YOGA</h1>
  <p>Email tes dari Temanyoga berhasil terkirim.</p>
  <p style="color:#6b5b4b;font-size:14px">Jika Anda menerima pesan ini, integrasi Resend sudah benar dan domain pengirim terverifikasi.</p>
</body>
</html>`;

    return await sendEmail({
      to,
      subject: "Tes Notifikasi Email — D'TEMAN YOGA",
      html,
      text: "Email tes dari Temanyoga berhasil terkirim. Integrasi Resend sudah benar.",
    });
  } catch (error) {
    console.error("sendEmailTest error:", error);
    return { success: false, detail: "Internal error" };
  }
}

export async function getEmailSetupStatus(): Promise<{
  apiKeyConfigured: boolean;
  enabled: boolean;
  from: string;
  replyTo: string;
}> {
  const enabled = await isEmailEnabled();
  return {
    apiKeyConfigured: Boolean(process.env.RESEND_API_KEY),
    enabled,
    from: await getFromAddress(),
    replyTo: await getReplyToAddress(),
  };
}
