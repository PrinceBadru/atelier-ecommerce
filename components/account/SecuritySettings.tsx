"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { renderSVG } from "uqr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  KeyRound,
  Trash2,
  Plus,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  Lock,
} from "lucide-react";

interface SecuritySettingsProps {
  initialTwoFactorEnabled?: boolean;
}

export function SecuritySettings({ initialTwoFactorEnabled = false }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [passkeys, setPasskeys] = useState<Array<{ id: string; name?: string; createdAt?: Date | string }>>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(true);

  // Passkey creation state
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  // 2FA TOTP setup state
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isSettingUpTotp, setIsSettingUpTotp] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [passwordFor2FA, setPasswordFor2FA] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load registered passkeys
  const loadPasskeys = async () => {
    try {
      setLoadingPasskeys(true);
      const res = await authClient.passkey.listUserPasskeys();
      if (res.data) {
        setPasskeys(res.data as Array<{ id: string; name?: string; createdAt?: Date | string }>);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingPasskeys(false);
    }
  };

  useEffect(() => {
    loadPasskeys();
  }, []);

  // Register a new passkey
  const handleAddPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsRegisteringPasskey(true);

    try {
      const res = await authClient.passkey.addPasskey({
        name: newPasskeyName.trim() || "My Security Key",
      });

      if (res?.error) {
        setErrorMessage(res.error.message || "Failed to register passkey.");
        setIsRegisteringPasskey(false);
        return;
      }

      setSuccessMessage("Passkey registered successfully! You can now sign in with one click.");
      setShowPasskeyModal(false);
      setNewPasskeyName("");
      await loadPasskeys();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Passkey registration failed or cancelled.");
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  // Delete a passkey
  const handleDeletePasskey = async (id: string) => {
    setErrorMessage("");
    try {
      const res = await authClient.passkey.deletePasskey({ id });
      if (res?.error) {
        setErrorMessage(res.error.message || "Could not remove passkey.");
        return;
      }
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
      setSuccessMessage("Passkey removed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting passkey.");
    }
  };

  // Start 2FA setup
  const handleStartTotpSetup = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSettingUpTotp(true);

    try {
      const res = await authClient.twoFactor.getTotpUri({
        password: passwordFor2FA || undefined,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Could not initialize TOTP. Please verify your password.");
        setIsSettingUpTotp(false);
        return;
      }

      if (res.data?.totpURI) {
        setTotpUri(res.data.totpURI);
        // Extract secret parameter from uri if present
        try {
          const u = new URL(res.data.totpURI);
          setTotpSecret(u.searchParams.get("secret") || "");
        } catch {
          setTotpSecret("");
        }
        setShowTotpSetup(true);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate authenticator code.");
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  // Verify and enable TOTP
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSettingUpTotp(true);

    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: totpCode.trim(),
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid 6-digit authenticator code.");
        setIsSettingUpTotp(false);
        return;
      }

      // Generate recovery backup codes
      try {
        const backupRes = await authClient.twoFactor.generateBackupCodes({
          password: passwordFor2FA || undefined,
        });
        if (backupRes.data?.backupCodes) {
          setBackupCodes(backupRes.data.backupCodes);
        }
      } catch {
        // Fallback
      }

      setTwoFactorEnabled(true);
      setSuccessMessage("Two-factor authentication is now active on your account!");
      setShowTotpSetup(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Could not complete 2FA activation.");
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;
    setErrorMessage("");
    try {
      const res = await authClient.twoFactor.disable({
        password: passwordFor2FA || undefined,
      });
      if (res.error) {
        setErrorMessage(res.error.message || "Could not disable two-factor.");
        return;
      }
      setTwoFactorEnabled(false);
      setSuccessMessage("Two-factor authentication disabled.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to disable 2FA.");
    }
  };

  const copyBackupCodes = () => {
    if (!backupCodes.length) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation1 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h2 className="font-display text-scale-20 font-medium">Security & Authentication</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage your hardware passkeys, biometric credentials, and two-factor authentication methods.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2.5 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Passkeys (WebAuthn / FIDO2) Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-medium text-foreground">Passkeys (Face ID, Touch ID, Security Keys)</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Sign in instantly without passwords using cryptographic biometrics.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPasskeyModal(true)}
            className="text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Passkey
          </Button>
        </div>

        {/* Modal for adding passkey */}
        {showPasskeyModal && (
          <form
            onSubmit={handleAddPasskey}
            className="rounded-lg border border-accent/30 bg-muted/20 p-4 space-y-3 animate-in fade-in duration-200"
          >
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-accent" /> Register New Passkey
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Give this key or device a nickname (e.g. &quot;MacBook Touch ID&quot;, &quot;Pixel 9 Pro&quot;, &quot;YubiKey 5C&quot;).
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Device Name (e.g. My Phone)"
                value={newPasskeyName}
                onChange={(e) => setNewPasskeyName(e.target.value)}
                className="text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={isRegisteringPasskey} className="text-xs whitespace-nowrap">
                {isRegisteringPasskey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Authorize"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasskeyModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Passkeys list */}
        {loadingPasskeys ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching registered passkeys...
          </div>
        ) : passkeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No passkeys registered yet. Click &quot;Add Passkey&quot; to enable one-click biometric sign-in.
          </div>
        ) : (
          <div className="space-y-2">
            {passkeys.map((pk) => (
              <div
                key={pk.id}
                className="rounded-lg border border-border bg-surface/50 p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{pk.name || "Biometric Security Key"}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      ID: {pk.id.slice(0, 12)}...
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePasskey(pk.id)}
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  title="Remove Passkey"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      {/* 2. Two-Factor Authentication (TOTP Authenticator) Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-medium text-foreground">Two-Factor Authentication (2FA)</h3>
              <Badge variant={twoFactorEnabled ? "success" : "secondary"} className="text-[10px]">
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Require a time-based 6-digit passcode (Google Authenticator, 1Password) on sign-in.
            </p>
          </div>

          {twoFactorEnabled ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisable2FA}
              className="text-xs text-destructive hover:bg-destructive/10 self-start sm:self-auto"
            >
              Disable 2FA
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTotpSetup}
              disabled={isSettingUpTotp}
              className="text-xs gap-1.5 self-start sm:self-auto"
            >
              {isSettingUpTotp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5" /> Enable Authenticator
                </>
              )}
            </Button>
          )}
        </div>

        {/* TOTP Setup Card */}
        {showTotpSetup && totpUri && (
          <div className="rounded-xl border border-accent/30 bg-muted/10 p-5 space-y-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent" /> Scan with Authenticator App
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code SVG */}
              <div
                className="bg-white p-3 rounded-lg shadow-sm border border-border w-44 h-44 flex items-center justify-center flex-shrink-0"
                dangerouslySetInnerHTML={{
                  __html: renderSVG(totpUri),
                }}
              />

              <div className="space-y-3 flex-1 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  1. Scan this QR code using Google Authenticator, 1Password, Authy, or Apple Passwords.
                </p>
                {totpSecret && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Or enter key manually:</span>
                    <div className="bg-background p-2 rounded border border-border font-mono text-[11px] select-all break-all">
                      {totpSecret}
                    </div>
                  </div>
                )}
                <p className="text-muted-foreground leading-relaxed">
                  2. Enter the 6-digit confirmation code shown in your app:
                </p>

                <form onSubmit={handleVerifyTotp} className="flex gap-2 max-w-xs">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.trim())}
                    className="text-center tracking-widest font-mono text-sm"
                    required
                    autoFocus
                  />
                  <Button type="submit" size="sm" disabled={isSettingUpTotp || totpCode.length < 6}>
                    {isSettingUpTotp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify & Turn On"}
                  </Button>
                </form>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTotpSetup(false)}
                className="text-xs"
              >
                Cancel Setup
              </Button>
            </div>
          </div>
        )}

        {/* Display Backup Codes after successful setup */}
        {backupCodes.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-500">
                <ShieldAlert className="w-4 h-4" /> Save Your Recovery Backup Codes
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyBackupCodes}
                className="text-xs h-7 gap-1"
              >
                {copiedCodes ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodes ? "Copied" : "Copy All"}</span>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              If you lose access to your authenticator device, each code can be used once to regain access to your account. Store them safely.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs bg-background/80 p-3 rounded border border-border">
              {backupCodes.map((c, i) => (
                <span key={i} className="text-center font-semibold">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
