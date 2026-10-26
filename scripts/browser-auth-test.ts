import { chromium } from "@playwright/test";

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("==================================================");
  console.log("  BROWSER AUTHENTICATION LIVE END-TO-END TEST");
  console.log("==================================================");

  // 1. Test One-Click Demo Shopper Login
  console.log("\n[TEST 1] Testing 1-Click Demo Shopper Login button...");
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  const demoShopperBtn = page.locator('button:has-text("Shopper Session")');
  console.log("Demo Shopper button found:", (await demoShopperBtn.count()) > 0);
  await demoShopperBtn.click();
  await page.waitForTimeout(4000);
  console.log("URL after Shopper login:", page.url());
  console.log("Account page reached:", page.url().includes("/account"));

  // 2. Test User Registration
  console.log("\n[TEST 2] Testing Customer Registration (Sign Up)...");
  const testEmail = `patron.live.${Date.now()}@atelier.dev`;
  await page.goto("https://atelier-web-5swv.onrender.com/register", { waitUntil: "networkidle" });
  await page.fill('#register-name', "Lady Genevieve");
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', "AtelierSecret2026!");
  await page.locator('button[type="submit"]:has-text("Register & Continue")').click();
  await page.waitForTimeout(4000);
  console.log("URL after Sign Up:", page.url());
  console.log("Sign up reached account:", page.url().includes("/account"));

  // 3. Test Email & Password Sign In
  console.log("\n[TEST 3] Testing Email & Password Sign In...");
  await context.clearCookies();
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  await page.fill('#customer-email', testEmail);
  await page.fill('#customer-password', "AtelierSecret2026!");
  await page.locator('button[type="submit"]:has-text("Sign In")').click();
  await page.waitForTimeout(4000);
  console.log("URL after Email/Password Sign In:", page.url());
  console.log("Sign in reached account:", page.url().includes("/account"));

  // 4. Test Magic Link
  console.log("\n[TEST 4] Testing Passwordless Magic Link Request...");
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Magic Link")').click();
  await page.waitForTimeout(500);
  await page.fill('#magic-email', "collector.genevieve@atelier.dev");
  await page.locator('button:has-text("Send Magic Link")').click();
  await page.waitForTimeout(3000);
  const magicSent = await page.locator('text=Magic Link Dispatched').count();
  console.log("Magic link success banner shown:", magicSent > 0);

  // 5. Test Social Login Graceful Notice (Google Button Click)
  console.log("\n[TEST 5] Testing Google Social Login graceful notice handling...");
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  const googleBtn = page.locator('button:has-text("Google")');
  console.log("Google button found:", (await googleBtn.count()) > 0);
  await googleBtn.click();
  await page.waitForTimeout(1000);
  const noticeShown = await page.locator('text=Google OAuth Setup Notice').count();
  console.log("Graceful OAuth setup notice displayed (no 401 white crash screen):", noticeShown > 0);

  // 6. Test Admin Login
  console.log("\n[TEST 6] Testing Admin Studio Portal Demo Login...");
  await page.goto("https://atelier-web-5swv.onrender.com/admin/login", { waitUntil: "networkidle" });
  const adminDemoBtn = page.locator('button:has-text("Instant Preview")');
  console.log("Demo Admin button found:", (await adminDemoBtn.count()) > 0);
  if (await adminDemoBtn.count() > 0) {
    await adminDemoBtn.first().click();
    await page.waitForTimeout(4000);
    console.log("URL after Demo Admin click:", page.url());
    console.log("Admin portal reached:", page.url().includes("/admin"));
  }

  console.log("\n==================================================");
  console.log("  ALL TESTS COMPLETED IN REAL BROWSER");
  console.log("==================================================");

  await browser.close();
}

run().catch(console.error);
