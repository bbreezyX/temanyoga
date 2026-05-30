import { z } from "zod";

export const updateSettingsSchema = z.object({
  whatsapp_enabled: z.enum(["true", "false"]).optional(),
  whatsapp_admin_phone: z
    .string()
    .max(30, "Phone number too long")
    .optional(),
  email_enabled: z.enum(["true", "false"]).optional(),
  email_from: z.string().max(200).optional(),
  email_reply_to: z.string().max(200).optional(),
  site_url: z
    .string()
    .url("Invalid URL format")
    .max(500)
    .optional(),
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(100).optional(),
  bank_account_name: z.string().max(100).optional(),
  origin_village_code: z
    .string()
    .max(15)
    .transform((val) => val.replace(/\./g, "").trim())
    .refine(
      (val) => val.length === 0 || /^\d{10}$/.test(val),
      "Kode kelurahan harus 10 digit",
    )
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/** All setting keys managed through the admin UI */
export const SETTING_KEYS = [
  "whatsapp_enabled",
  "whatsapp_admin_phone",
  "email_enabled",
  "email_from",
  "email_reply_to",
  "site_url",
  "bank_name",
  "bank_account_number",
  "bank_account_name",
  "origin_village_code",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
