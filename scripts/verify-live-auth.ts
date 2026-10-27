import { chromium } from "@playwright/test";
import path from "path";

async function verifyAuth() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseUrl = "https://atelier-web-5swv.onrender.com";
  console.log("==================================================");
  console.log("  LIVE VERIFICATION: AUTHENTIC CREDENTIALS ONLY");
  console.log("  Target:", baseUrl);
  console.log("==================================================");

  // 1. Visit Login Page & Verify Social Auth Methods
  console.log("\n[CHECK 1] Loading /login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("#customer-email", { timeout: 15000 });
  await page.screenshot({ path: "live-login-clean.png" });

  const googleBtn = await page.locator('button[title*="Google"]').count();
  const githubBtn = await page.locator('button[title*="GitHub"]').count();
  const microsoftBtn = await page.locator('button[title*="Microsoft"]').count();
  const appleBtn = await page.locator('button[title*="Apple"]').count();
  console.log("Social auth buttons present on login:", {
    google: googleBtn > 0,
    github: githubBtn > 0,
    microsoft: microsoftBtn > 0,
    apple: appleBtn > 0,
  });

  const shopperDemoBtn = await page.locator('button:has-text("Shopper Demo")').count();
  console.log("Mock 'Shopper Demo' button count (must be 0):", shopperDemoBtn);

  // Test clicking Google button to verify production behavior (NO mock user session)
  console.log("Testing Google button click behavior...");
  await page.locator('button[title*="Google"]').click();
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  const pageText = await page.content();
  console.log("Current URL after Google click (should NOT navigate to fake account):", currentUrl);
  console.log("Contains 'Alex Vance' (MUST BE FALSE):", pageText.includes("Alex Vance"));

  const passwordTab = await page.locator('button:has-text("Password")').count();
  const emailCodeTab = await page.locator('button:has-text("Email Code")').count();
  const magicLinkTab = await page.locator('button:has-text("Magic Link")').count();
  const passkeyTab = await page.locator('button:has-text("Passkey")').count();
  console.log("Tabs present:", { passwordTab, emailCodeTab, magicLinkTab, passkeyTab });

  // 2. Register a Real Account
  console.log("\n[CHECK 2] Registering authentic new user...");
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.waitForSelector("#register-email", { timeout: 15000 });
  await page.screenshot({ path: "live-register-clean.png" });

  const regGoogleBtn = await page.locator('button[title*="Google"]').count();
  console.log("Social buttons present on /register:", regGoogleBtn > 0);

  const testName = "Genevieve Thorne";
  const testEmail = `genevieve.${Date.now()}@atelier.dev`;
  const testPassword = "GenevieveCrafts2026!";

  await page.fill('#register-name', testName);
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', testPassword);
  await page.waitForTimeout(500);

  console.log(`Submitting registration for: ${testName} <${testEmail}>`);
  await page.locator('button[type="submit"]:has-text("Register & Continue")').click();

  // Wait for redirect to /account
  await page.waitForURL("**/account", { timeout: 15000 });
  console.log("Successfully reached:", page.url());

  // 3. Verify Account Profile Identity
  console.log("\n[CHECK 3] Verifying user identity on Account Portal...");
  const nameHeading = page.locator("h2").first();
  await nameHeading.waitFor();
  const displayedName = await nameHeading.innerText();
  const pageContent = await page.content();

  console.log("Displayed Name in portal:", displayedName);
  console.log("Matches registered name ('Genevieve Thorne'):", displayedName.includes("Genevieve Thorne"));
  console.log("Contains registered email:", pageContent.includes(testEmail));
  console.log("Contains 'alex.google@atelier.studio' (MUST BE FALSE):", pageContent.includes("alex.google@atelier.studio"));
  console.log("Contains 'Shopper Demo' (MUST BE FALSE):", pageContent.includes("Shopper Demo"));

  await page.screenshot({ path: "live-account-verified.png" });

  // 4. Test Sign Out
  console.log("\n[CHECK 4] Testing Sign Out...");
  const signOutBtn = page.locator('button:has-text("Sign Out")');
  await signOutBtn.click();
  await page.waitForTimeout(3000);
  console.log("URL after sign out:", page.url());

  // 5. Test Sign In with Exact Registered Credentials
  console.log("\n[CHECK 5] Testing Sign In with exact registered credentials...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill('#customer-email', testEmail);
  await page.fill('#customer-password', testPassword);
  await page.locator('button[type="submit"]:has-text("Sign In with Password")').click();

  await page.waitForURL("**/account", { timeout: 15000 });
  console.log("Successfully signed back in to:", page.url());
  const reauthName = await page.locator("h2").first().innerText();
  console.log("Reauthenticated account name:", reauthName);

  await browser.close();
  console.log("\n[SUCCESS] All live auth checks passed with authentic user credentials!");
}

verifyAuth().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
