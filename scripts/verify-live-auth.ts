import { chromium } from "@playwright/test";

async function verifyAuth() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseUrl = "https://atelier-web-5swv.onrender.com";
  console.log("==================================================");
  console.log("  LIVE VERIFICATION: FLARE OPTION A + DEMO LOGINS");
  console.log("  Target:", baseUrl);
  console.log("==================================================");

  // 1. Visit Login Page & Assert Flare Option A + Demo Logins
  console.log("\n[CHECK 1] Loading /login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("#customer-email", { timeout: 15000 });
  await page.screenshot({ path: "live-login-option-a.png" });

  const pageHtml = await page.content();
  const hasCredentialNotice =
    pageHtml.includes("GOOGLE_CLIENT_ID") ||
    pageHtml.includes("requires production OAuth credentials");
  console.log("Developer credential warning visible (MUST BE FALSE):", hasCredentialNotice);

  if (hasCredentialNotice) {
    throw new Error("Credential warning notice is still visible!");
  }

  const passwordTab = await page.locator('button:has-text("Password")').count();
  const emailCodeTab = await page.locator('button:has-text("Email Code")').count();
  const magicLinkTab = await page.locator('button:has-text("Magic Link")').count();
  const passkeyTab = await page.locator('button:has-text("Passkey")').count();

  console.log("Native Auth Methods present:", {
    password: passwordTab > 0,
    emailCode: emailCodeTab > 0,
    magicLink: magicLinkTab > 0,
    passkey: passkeyTab > 0,
  });

  const testUserBtn = await page.locator('button:has-text("Test User")').count();
  const studioAdminBtn = await page.locator('button:has-text("Studio Admin")').count();
  console.log("Quick Demo Logins present:", {
    testUser: testUserBtn > 0,
    studioAdmin: studioAdminBtn > 0,
  });

  if (testUserBtn === 0 || studioAdminBtn === 0) {
    throw new Error("Test User or Studio Admin button missing on login page!");
  }

  // 2. Test One-Click Test User Login
  console.log("\n[CHECK 2] Testing One-Click Test User login...");
  await page.locator('button:has-text("Test User")').click();
  await page.waitForURL((url) => url.pathname.includes("/account"), { timeout: 20000 });
  console.log("Successfully logged in as Test User! Current URL:", page.url());
  await page.screenshot({ path: "live-account-test-user.png" });

  const accountContent = await page.content();
  console.log("Account shows demo user email (demo@atelier.dev):", accountContent.includes("demo@atelier.dev"));

  // 3. Test One-Click Studio Admin Login
  console.log("\n[CHECK 3] Testing One-Click Studio Admin login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('button:has-text("Studio Admin")').click();
  await page.waitForURL((url) => url.pathname.includes("/admin"), { timeout: 20000 });
  console.log("Successfully logged in as Studio Admin! Current URL:", page.url());
  await page.screenshot({ path: "live-admin-dashboard.png" });

  const adminContent = await page.content();
  console.log("Admin Dashboard accessible:", adminContent.includes("Admin") || adminContent.includes("Dashboard") || adminContent.includes("Studio"));

  await browser.close();
  console.log("\n==================================================");
  console.log("  FLARE OPTION A & DEMO LOGINS FULLY VERIFIED LIVE!");
  console.log("==================================================");
}

verifyAuth().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
