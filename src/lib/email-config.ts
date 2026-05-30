/** Default sender domain — must be verified in Resend. */
export const EMAIL_DOMAIN = "temaniyoga.com";

/** Pre-migration domain — still stored in some production DB rows. */
export const LEGACY_EMAIL_DOMAIN = "ditemaniyoga.com";

export const DEFAULT_EMAIL_FROM =
  `D'TEMAN YOGA <notifikasi@${EMAIL_DOMAIN}>`;

export const DEFAULT_EMAIL_REPLY_TO = `cs@${EMAIL_DOMAIN}`;

export const DEFAULT_EMAIL_FROM_ADDRESS = `notifikasi@${EMAIL_DOMAIN}`;

export function usesLegacyEmailDomain(value: string | null | undefined): boolean {
  return Boolean(value?.includes(LEGACY_EMAIL_DOMAIN));
}

/** Rewrite legacy sender domain to the verified Resend domain. */
export function normalizeEmailSetting(value: string): string {
  if (!usesLegacyEmailDomain(value)) return value;
  return value.replaceAll(LEGACY_EMAIL_DOMAIN, EMAIL_DOMAIN);
}
