/**
 * One-time password handling for the password-reset flow.
 *
 * The API emails an 8-digit code. People paste it with spaces, dashes, or a
 * trailing newline picked up from the email client, so the raw value is
 * normalized to digits before validation — otherwise a perfectly valid code
 * gets rejected for cosmetic reasons.
 */

export const OTP_LENGTH = 8;

/** Strip everything that is not a digit. */
export function normalizeOtp(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** True when the normalized value is exactly the expected number of digits. */
export function isValidOtp(raw: string): boolean {
  return normalizeOtp(raw).length === OTP_LENGTH;
}
