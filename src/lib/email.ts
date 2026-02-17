import { Resend } from "resend";
import { getSiteSetting } from "@/lib/whatsapp";

type SendResult = {
  success: boolean;
  detail?: string;
};

const DEFAULT_FROM = "D'TEMAN YOGA <notifikasi@ditemaniyoga.com>";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
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

    const resend = getResend();
    if (!resend) {
      return { success: false, detail: "RESEND_API_KEY not configured" };
    }

    const from = (await getSiteSetting("email_from")) || DEFAULT_FROM;

    const replyTo =
      (await getSiteSetting("email_reply_to")) || "cs@ditemaniyoga.com";

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo,
      subject,
      html,
      text: text || undefined,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, detail: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("sendEmailToCustomer error:", error);
    return { success: false, detail: "Internal error" };
  }
}
