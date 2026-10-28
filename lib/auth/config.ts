/**
 * Flare Framework Auth Configuration for Atelier
 * Adapted from Flare (https://flare-docs.codetotech.com / https://github.com/MUKE-coder/flare-framework)
 *
 * Controls available sign-in methods, two-factor policies, and social providers.
 */

export type SocialProvider = "google" | "github" | "apple" | "microsoft";

export const authConfig = {
  /** A sign-in link by email. */
  magicLink: true,

  /** A 6-digit sign-in code by email (OTP). */
  emailOtp: true,

  /** Face ID, Touch ID, Windows Hello or FIDO2 security key. */
  passkeys: true,

  twoFactor: {
    /** Codes from an authenticator app (TOTP), with backup codes. */
    authenticator: true,
    /** Codes by email as the second step. */
    email: true,
  },

  /**
   * Social sign-in. Flare Framework Option A: Each provider switches on only when its
   * credentials are set in environment variables.
   */
  social: [] as SocialProvider[],

  /** Refuse password sign-in until email is verified. */
  requireEmailVerification: false,

  /**
   * Check new passwords against Have I Been Pwned's breach list (k-Anonymity SHA-1).
   */
  checkBreachedPasswords: true,

  /** Admin role integration */
  admin: true,
};

/** Whether any second factor can be configured. */
export const twoFactorAvailable =
  authConfig.twoFactor.authenticator || authConfig.twoFactor.email;
