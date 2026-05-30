import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, badRequest, serverError } from "@/lib/api-response";
import { sendEmailTest } from "@/lib/email";

const testEmailSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .transform((val) => val.trim().toLowerCase()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = testEmailSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const result = await sendEmailTest(parsed.data.email);

    if (!result.success) {
      return badRequest(result.detail || "Gagal mengirim email tes");
    }

    return apiSuccess({
      message: `Email tes terkirim ke ${parsed.data.email}`,
    });
  } catch (error) {
    console.error("POST /api/admin/email-test error:", error);
    return serverError();
  }
}
