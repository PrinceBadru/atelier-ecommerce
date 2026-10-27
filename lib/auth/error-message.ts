/**
 * Flare Framework Auth Error Formatter
 * Formats Better Auth errors into clean, customer-facing messages.
 */

export function authErrorMessage(
  error: { code?: string; message?: string } | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email first. We've sent you a new verification link.";
    case "INVALID_OTP":
    case "INVALID_CODE":
    case "INVALID_TWO_FACTOR_CODE":
      return "That code isn't right. Check it and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Please request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many attempts. Please request a new code.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Sign in instead.";
    case "PASSWORD_TOO_SHORT":
      return "Password must be at least 8 characters.";
    default:
      return error?.message || fallback;
  }
}
