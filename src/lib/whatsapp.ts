import { prisma } from "@/lib/prisma";

const FONNTE_API_URL = "https://api.fonnte.com/send";

type FonnteResponse = {
  status: boolean;
  detail?: string;
  reason?: string;
};

type SendResult = {
  success: boolean;
  detail?: string;
};

/**
 * Get a site setting value from the database.
 * Returns null if the setting doesn't exist.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

/**
 * Get multiple site settings as a key-value map.
 */
export async function getSiteSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

/**
 * Check if WhatsApp notifications are enabled.
 * Requires both FONNTE_TOKEN env var and whatsapp_enabled setting.
 */
async function isWhatsAppEnabled(): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return false;

  const enabled = await getSiteSetting("whatsapp_enabled");
  return enabled === "true";
}

/**
 * Send a WhatsApp message via Fonnte API.
 * This is fire-and-forget safe — errors are logged but never thrown.
 */
async function sendFonnte(
  target: string,
  message: string
): Promise<SendResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    return { success: false, detail: "FONNTE_TOKEN not configured" };
  }

  try {
    const formData = new FormData();
    formData.append("target", target);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = (await response.json()) as FonnteResponse;

    if (data.status) {
      return { success: true, detail: data.detail };
    }

    console.error("Fonnte API error:", data.reason || "Unknown error");
    return { success: false, detail: data.reason };
  } catch (error) {
    console.error("Fonnte API request failed:", error);
    return { success: false, detail: "Network error" };
  }
}

/**
 * Send a WhatsApp message to a customer.
 * Checks if WhatsApp is enabled before sending.
 * Safe to call without await — will not throw.
 */
export async function sendWhatsAppToCustomer(
  phone: string,
  message: string
): Promise<SendResult> {
  try {
    const enabled = await isWhatsAppEnabled();
    if (!enabled) {
      return { success: false, detail: "WhatsApp notifications disabled" };
    }
    return sendFonnte(phone, message);
  } catch (error) {
    console.error("sendWhatsAppToCustomer error:", error);
    return { success: false, detail: "Internal error" };
  }
}

/**
 * Send a WhatsApp message to the admin.
 * Uses the whatsapp_admin_phone setting from the database.
 * Safe to call without await — will not throw.
 */
export async function sendWhatsAppToAdmin(
  message: string
): Promise<SendResult> {
  try {
    const enabled = await isWhatsAppEnabled();
    if (!enabled) {
      return { success: false, detail: "WhatsApp notifications disabled" };
    }

    const adminPhone = await getSiteSetting("whatsapp_admin_phone");
    if (!adminPhone) {
      return { success: false, detail: "Admin phone not configured" };
    }

    return sendFonnte(adminPhone, message);
  } catch (error) {
    console.error("sendWhatsAppToAdmin error:", error);
    return { success: false, detail: "Internal error" };
  }
}

/**
 * Send a test WhatsApp message to verify connectivity.
 * Bypasses the whatsapp_enabled check for testing purposes.
 */
export async function sendWhatsAppTest(
  phone: string
): Promise<SendResult> {
  return sendFonnte(
    phone,
    "Ini adalah pesan tes dari Temanyoga. Jika Anda menerima pesan ini, integrasi WhatsApp berhasil!"
  );
}
