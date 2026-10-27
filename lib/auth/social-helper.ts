/**
 * Atelier Authentic Social Sign-In Helper
 * Maps direct OAuth sign-ins to authentic Better Auth credentials without mock personas.
 */

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function deriveSocialPassword(email: string, provider: string): string {
  const normalized = email.toLowerCase().trim();
  const h1 = simpleHash(`${provider}:${normalized}:atelier_auth_v1`);
  const h2 = simpleHash(`${normalized}:salt_2026_luxury`);
  // Complies with all strict password rules: min 16 chars, uppercase, lowercase, numbers, symbols
  return `Atelier#1${h1}${h2}Secure!Aa`;
}

export function deriveNameFromEmail(email: string): string {
  const userPart = email.split("@")[0] || "Shopper";
  // Convert "john.doe" or "john_doe" to "John Doe"
  return userPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Atelier Member";
}
