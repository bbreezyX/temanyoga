import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import {
  updateSettingsSchema,
  SETTING_KEYS,
} from "@/lib/validations/settings";
import { sendWhatsAppTest } from "@/lib/whatsapp";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

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

      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      results[key] = value;
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
