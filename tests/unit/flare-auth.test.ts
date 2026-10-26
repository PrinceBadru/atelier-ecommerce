import { describe, it, expect } from "vitest";
import { authConfig, twoFactorAvailable } from "@/lib/auth/config";
import {
  checkPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "@/lib/auth/password-rules";
import { authClient } from "@/lib/auth/client";

describe("Flare Framework Authentication Configuration", () => {
  it("has all Flare auth methods enabled in authConfig", () => {
    expect(authConfig.magicLink).toBe(true);
    expect(authConfig.emailOtp).toBe(true);
    expect(authConfig.passkeys).toBe(true);
    expect(authConfig.twoFactor.authenticator).toBe(true);
    expect(authConfig.twoFactor.email).toBe(true);
    expect(twoFactorAvailable).toBe(true);
    expect(authConfig.social).toContain("google");
    expect(authConfig.social).toContain("github");
    expect(authConfig.social).toContain("microsoft");
    expect(authConfig.social).toContain("apple");
  });

  it("checks password length boundaries correctly", () => {
    const tooShort = checkPassword("short");
    expect(tooShort.valid).toBe(false);
    expect(tooShort.rules.find((r) => r.id === "length")?.met).toBe(false);

    const validLength = checkPassword("artisan-leather-craft-2026");
    expect(validLength.valid).toBe(true);
    expect(validLength.rules.find((r) => r.id === "length")?.met).toBe(true);
    expect(validLength.score).toBeGreaterThanOrEqual(3);
  });

  it("rejects common passwords from the credential-stuffing list", () => {
    const common = checkPassword("password123");
    expect(common.rules.find((r) => r.id === "notCommon")?.met).toBe(false);

    const keyboardRun = checkPassword("qwertyuiop123");
    expect(keyboardRun.rules.find((r) => r.id === "notCommon")?.met).toBe(false);
  });

  it("flags personal information matches in passwords", () => {
    const personal = checkPassword("ElenaCrafts2026!", ["Elena Vance", "elena@atelier.studio"]);
    expect(personal.rules.find((r) => r.id === "notPersonal")?.met).toBe(false);

    const unrelated = checkPassword("Obsidian-Clay-Vessel-99!", ["Elena Vance", "elena@atelier.studio"]);
    expect(unrelated.rules.find((r) => r.id === "notPersonal")?.met).toBe(true);
  });

  it("provides client methods for all Flare auth plugins", () => {
    expect(typeof authClient.signIn.email).toBe("function");
    expect(typeof authClient.signIn.social).toBe("function");
    expect(typeof authClient.signIn.magicLink).toBe("function");
    expect(typeof authClient.signIn.emailOtp).toBe("function");
    expect(typeof authClient.signIn.passkey).toBe("function");
    expect(typeof authClient.emailOtp.sendVerificationOtp).toBe("function");
    expect(typeof authClient.passkey.addPasskey).toBe("function");
    expect(typeof authClient.passkey.listUserPasskeys).toBe("function");
    expect(typeof authClient.twoFactor.getTotpUri).toBe("function");
    expect(typeof authClient.twoFactor.verifyTotp).toBe("function");
    expect(typeof authClient.twoFactor.sendOtp).toBe("function");
    expect(typeof authClient.twoFactor.verifyOtp).toBe("function");
    expect(typeof authClient.twoFactor.verifyBackupCode).toBe("function");
  });
});
