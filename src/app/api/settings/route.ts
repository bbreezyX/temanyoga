import { prisma } from "@/lib/prisma";
import { apiSuccess, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["bank_name", "bank_account_number", "bank_account_name"],
        },
      },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    // Provide defaults if not set
    return apiSuccess({
      bank_name: map.bank_name || "BCA",
      bank_account_number: map.bank_account_number || "1234567890",
      bank_account_name: map.bank_account_name || "D'TEMAN YOGA Studio",
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return serverError();
  }
}
