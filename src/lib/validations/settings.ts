import { z } from "zod";

export const updateSettingsSchema = z.object({
  whatsapp_enabled: z.enum(["true", "false"]).optional(),
  whatsapp_admin_phone: z
    .string()
    .max(30, "Phone number too long")
    .optional(),
  site_url: z
    .string()
    .url("Invalid URL format")
    .max(500)
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/** All setting keys managed through the admin UI */
export const SETTING_KEYS = [
  "whatsapp_enabled",
  "whatsapp_admin_phone",
  "site_url",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
