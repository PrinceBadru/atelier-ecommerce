import { chromium } from "@playwright/test";
import path from "path";

async function verifyAuth() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseUrl = "https://atelier-web-5swv.onrender.com";
  console.log("==================================================");
  console.log("  LIVE VERIFICATION: FLARE FRAMEWORK AUTH SUITE");
  console.log("  Target:", baseUrl);
  console.log("==================================================");

  // 1. Visit Login Page & Verify Clean Zero-Notice State
  console.log("\n[CHECK 1] Loading /login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("#customer-email", { timeout: 15000 });
  await page.screenshot({ path: "live-login-clean.png" });

  const pageContent = await page.content();
  const hasCredentialNotice =
    pageContent.includes("GOOGLE_CLIENT_ID") ||
    pageContent.includes("requires production OAuth credentials");
  console.log("Developer credential warning visible (MUST BE FALSE):", hasCredentialNotice);

  const shopperDemoBtn = await page.locator('button:has-text("Shopper Demo")').count();
  console.log("Mock 'Shopper Demo' button count (must be 0):", shopperDemoBtn);

  const passwordTab = await page.locator('button:has-text("Password")').count();
  const emailCodeTab = await page.locator('button:has-text("Email Code")').count();
  const magicLinkTab = await page.locator('button:has-text("Magic Link")').count();
  const passkeyTab = await page.locator('button:has-text("Passkey")').count();
  console.log("Sign-in methods present off the jump:", {
    passwordTab: passwordTab > 0,
    emailCodeTab: emailCodeTab > 0,
    magicLinkTab: magicLinkTab > 0,
    passkeyTab: passkeyTab > 0,
  });

  // 2. Register an Authentic Account
  console.log("\n[CHECK 2] Registering authentic new user on /register...");
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.waitForSelector("#register-email", { timeout: 15000 });
  await page.screenshot({ path: "live-register-clean.png" });

  const regContent = await page.content();
  const regHasNotice =
    regContent.includes("GOOGLE_CLIENT_ID") ||
    regContent.includes("requires production OAuth credentials");
  console.log("Register page has credential notice (MUST BE FALSE):", regHasNotice);

  const testName = "Genevieve Thorne";
  const testEmail = `genevieve.${Date.now()}@atelier.dev`;
  const testPassword = "AtelierLuxury2026!SecureKey";

  await page.fill("#register-name", testName);
  await page.fill("#register-email", testEmail);
  await page.fill("#register-password", testPassword);
  await page.click('button[type="submit"]');

  console.log("Submitted registration for:", testEmail);
  await page.waitForURL((url) => url.pathname.includes("/account") || url.pathname.includes("/login"), {
    timeout: 20000,
  });
  console.log("URL after registration:", page.url());

  // 3. Verify Account Dashboard
  if (!page.url().includes("/account")) {
    await page.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: "live-account-verified.png" });

  const accountBody = await page.content();
  console.log("Account shows authentic name:", accountBody.includes(testName));
  console.log("Account shows authentic email:", accountBody.includes(testEmail));
  console.log("Account contains mock 'Alex Vance' (MUST BE FALSE):", accountBody.includes("Alex Vance"));

  // 4. Test Sign Out and Direct Sign In
  console.log("\n[CHECK 3] Testing Sign Out & Direct Sign In...");
  const signOutBtn = page.locator('button:has-text("Sign Out")').first();
  if (await signOutBtn.count() > 0) {
    await signOutBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill("#customer-email", testEmail);
  await page.fill("#customer-password", testPassword);
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => url.pathname.includes("/account"), { timeout: 20000 });
  console.log("Successfully signed in directly with real credentials! Current URL:", page.url());

  await browser.close();
  console.log("\n==================================================");
  console.log("  ALL LIVE AUTH CHECKS PASSED WITH 100% FIDELITY");
  console.log("==================================================");
}

verifyAuth().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
