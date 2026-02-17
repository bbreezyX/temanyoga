/**
 * Input sanitization utilities for XSS prevention
 * Sanitizes user-submitted text while preserving legitimate content
 */

/**
 * Escape HTML special characters to prevent XSS
 * Use for all user-submitted text that will be rendered in HTML
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3D;");
}

/**
 * Remove HTML tags from input, keeping only text content
 * Use for fields that should never contain HTML
 */
export function stripHtml(input: string): string {
  let cleaned = input.replace(/<[^>]*>/g, "");
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
  return cleaned;
}

/**
 * Sanitize text input for safe storage and display
 * Trims whitespace and escapes HTML characters
 */
export function sanitizeText(input: string, maxLength?: number): string {
  let sanitized = input.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return escapeHtml(sanitized);
}

/**
 * Sanitize multiline text (preserves newlines)
 */
export function sanitizeMultilineText(
  input: string,
  maxLength?: number
): string {
  let sanitized = input.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return escapeHtml(sanitized);
}

/**
 * Validate and sanitize email address
 * Returns null if invalid, sanitized email if valid
 */
export function sanitizeEmail(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  return escapeHtml(trimmed);
}

/**
 * Sanitize phone number - only allows digits, spaces, dashes, parentheses, and plus
 */
export function sanitizePhone(input: string): string {
  const cleaned = input.replace(/[^\d\s\-\(\)\+]/g, "");
  return cleaned.trim();
}

/**
 * Sanitize a name field - allows letters, spaces, and common name characters
 */
export function sanitizeName(input: string, maxLength = 200): string {
  const cleaned = input.replace(/[^\p{L}\s'.-]/gu, "");
  return sanitizeText(cleaned, maxLength);
}

/**
 * Sanitize address field - allows alphanumeric, common punctuation
 */
export function sanitizeAddress(input: string, maxLength = 500): string {
  const cleaned = input.replace(/[^\p{L}\p{N}\s'.,#\/-]/gu, "");
  return sanitizeMultilineText(cleaned, maxLength);
}

/**
 * Sanitize order notes - more permissive but still safe
 */
export function sanitizeNotes(input: string, maxLength = 1000): string {
  return sanitizeMultilineText(input, maxLength);
}

/**
 * Sanitize product description - allows basic formatting but removes dangerous elements
 * This is for admin-submitted content that may need basic HTML
 */
export function sanitizeDescription(input: string): string {
  return escapeHtml(input.trim());
}

/**
 * Check if a string contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i,
  ];
  return dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize an object's string fields in place
 * Useful for sanitizing form data before validation
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: Record<keyof T, "text" | "email" | "phone" | "name" | "address" | "notes">
): T {
  const result = { ...obj };

  for (const [key, type] of Object.entries(fields) as [keyof T, string][]) {
    const value = result[key];
    if (typeof value === "string") {
      switch (type) {
        case "email":
          result[key] = sanitizeEmail(value) as T[keyof T];
          break;
        case "phone":
          result[key] = sanitizePhone(value) as T[keyof T];
          break;
        case "name":
          result[key] = sanitizeName(value) as T[keyof T];
          break;
        case "address":
          result[key] = sanitizeAddress(value) as T[keyof T];
          break;
        case "notes":
          result[key] = sanitizeNotes(value) as T[keyof T];
          break;
        case "text":
        default:
          result[key] = sanitizeText(value) as T[keyof T];
          break;
      }
    }
  }

  return result;
}