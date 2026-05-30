import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import {
  normalizeEmailSetting,
  usesLegacyEmailDomain,
} from "@/lib/email-config";
import {
  updateSettingsSchema,
  SETTING_KEYS,
} from "@/lib/validations/settings";
import { sendWhatsAppTest } from "@/lib/whatsapp";

const LEGACY_DOMAIN_SETTING_KEYS = [
  "email_from",
  "email_reply_to",
  "site_url",
] as const;

async function migrateLegacyDomainSettings(
  map: Record<string, string>,
): Promise<void> {
  for (const key of LEGACY_DOMAIN_SETTING_KEYS) {
    const value = map[key];
    if (!usesLegacyEmailDomain(value)) continue;

    const normalized = normalizeEmailSetting(value);
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: normalized },
      create: { key, value: normalized },
    });
    map[key] = normalized;
  }
}

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    await migrateLegacyDomainSettings(map);

    return apiSuccess(map);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const updates = parsed.data;
    const results: Record<string, string> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;

      const normalized =
        LEGACY_DOMAIN_SETTING_KEYS.includes(
          key as (typeof LEGACY_DOMAIN_SETTING_KEYS)[number],
        ) && typeof value === "string"
          ? normalizeEmailSetting(value)
          : value;

      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: normalized },
        create: { key, value: normalized },
      });
      results[key] = normalized;
    }

    return apiSuccess(results);
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return serverError();
  }
}

/** POST /api/admin/settings — send a test WhatsApp message */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.phone as string | undefined;

    if (!phone || phone.trim().length === 0) {
      return badRequest("Phone number is required");
    }

    const result = await sendWhatsAppTest(phone.trim());

    if (result.success) {
      return apiSuccess({ message: "Test message sent successfully" });
    }

    return badRequest(result.detail || "Failed to send test message");
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return serverError();
  }
}
