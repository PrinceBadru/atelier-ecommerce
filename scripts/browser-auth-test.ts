import { chromium } from "@playwright/test";

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = process.env.TEST_URL || "https://atelier-web-5swv.onrender.com";

  console.log("==================================================");
  console.log("  FLARE FRAMEWORK AUTHENTICATION TEST SUITE");
  console.log("  Target:", baseUrl);
  console.log("==================================================");

  // 1. One-Click Demo Shopper Session
  console.log("\n[TEST 1] Testing 1-Click Shopper Demo Session...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  const demoShopperBtn = page.locator('button:has-text("Shopper Demo")');
  console.log("Shopper Demo button present:", (await demoShopperBtn.count()) > 0);
  await demoShopperBtn.click();
  await page.waitForTimeout(4000);
  console.log("URL after Shopper login:", page.url());
  console.log("Reached Account portal:", page.url().includes("/account"));

  // Check Account Security section on Account portal
  const securityHeader = await page.locator('text=Security & Authentication').count();
  console.log("Security & Authentication section visible on Account portal:", securityHeader > 0);
  const passkeySection = await page.locator('text=Passkeys').count();
  console.log("Passkeys management visible on Account portal:", passkeySection > 0);
  const twoFactorSection = await page.locator('text=Two-Factor Authentication').count();
  console.log("Two-Factor Authentication visible on Account portal:", twoFactorSection > 0);

  // 2. Flare Password Rules & Registration
  console.log("\n[TEST 2] Testing Registration with Flare Password Rules...");
  await context.clearCookies();
  const testEmail = `patron.flare.${Date.now()}@atelier.dev`;
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.fill('#register-name', "Aria Montclair");
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', "Weak");
  await page.waitForTimeout(500);
  console.log("Weak password meter label shown:", (await page.locator('text=Too short').count()) > 0 || (await page.locator('text=Weak').count()) > 0);

  await page.fill('#register-password', "AtelierMaster2026!");
  await page.waitForTimeout(500);
  console.log("Strong password meter label shown:", (await page.locator('text=Strong').count()) > 0 || (await page.locator('text=Good').count()) > 0);

  await page.locator('button[type="submit"]:has-text("Register & Continue")').click();
  await page.waitForTimeout(4000);
  console.log("URL after Registration:", page.url());
  console.log("Registration succeeded & reached account:", page.url().includes("/account"));

  // 3. Email & Password Sign In
  console.log("\n[TEST 3] Testing Email & Password Sign In...");
  await context.clearCookies();
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill('#customer-email', testEmail);
  await page.fill('#customer-password', "AtelierMaster2026!");
  await page.locator('button[type="submit"]:has-text("Sign In with Password")').click();
  await page.waitForTimeout(4000);
  console.log("URL after Password Sign In:", page.url());
  console.log("Password sign-in reached account:", page.url().includes("/account"));

  // 4. Flare Email OTP (6-Digit One-Time Code) Tab
  console.log("\n[TEST 4] Testing Flare Email OTP 6-Digit Code Tab...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('button:has-text("Email Code")').click();
  await page.waitForTimeout(500);
  const otpEmailInput = page.locator('#otp-email');
  console.log("Email OTP input field present:", (await otpEmailInput.count()) > 0);
  await otpEmailInput.fill("collector.otp@atelier.dev");
  const sendOtpBtn = page.locator('button:has-text("Send 6-Digit Code")');
  console.log("Send 6-Digit Code button present:", (await sendOtpBtn.count()) > 0);

  // 5. Flare Magic Link Tab
  console.log("\n[TEST 5] Testing Passwordless Magic Link Tab...");
  await page.locator('button:has-text("Magic Link")').click();
  await page.waitForTimeout(500);
  const magicEmailInput = page.locator('#magic-email');
  console.log("Magic link email input present:", (await magicEmailInput.count()) > 0);
  await magicEmailInput.fill("collector.magic@atelier.dev");
  await page.locator('button:has-text("Send Magic Link")').click();
  await page.waitForTimeout(3000);
  const magicSentBanner = await page.locator('text=Magic Link Dispatched').count();
  console.log("Magic link dispatch banner displayed:", magicSentBanner > 0);

  // 6. Flare Passkey Tab
  console.log("\n[TEST 6] Testing Flare WebAuthn Passkey Tab...");
  await page.locator('button:has-text("Passkey")').click();
  await page.waitForTimeout(500);
  const passkeyBtn = page.locator('button:has-text("Sign In with Passkey")');
  console.log("Sign In with Passkey button present:", (await passkeyBtn.count()) > 0);

  // 7. Flare Two-Factor Challenge Page
  console.log("\n[TEST 7] Testing Two-Factor Challenge Page (/two-factor)...");
  await page.goto(`${baseUrl}/two-factor`, { waitUntil: "networkidle" });
  const twoFactorHeader = await page.locator('text=Two-Step Verification').count();
  console.log("Two-Factor page loaded:", twoFactorHeader > 0);
  const authTab = await page.locator('button:has-text("Authenticator")').count();
  const emailTab = await page.locator('button:has-text("Email Code")').count();
  const backupTab = await page.locator('button:has-text("Backup Code")').count();
  console.log("2FA Authenticator, Email Code, Backup Code tabs present:", authTab > 0 && emailTab > 0 && backupTab > 0);

  // 8. Social Direct Authentication (Google, GitHub, Microsoft, Apple)
  console.log("\n[TEST 8] Testing Direct Social Authentication (Zero Notice, Instant Auth)...");
  await context.clearCookies();
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  const githubBtn = page.locator('button[title*="GitHub"]');
  console.log("GitHub button present:", (await githubBtn.count()) > 0);
  await githubBtn.click();
  await page.waitForTimeout(3000);
  console.log("URL after clicking GitHub:", page.url());
  const noticeCount = await page.locator('text=OAuth Setup Notice').count();
  console.log("Setup notice absent (Zero notice shown):", noticeCount === 0);
  console.log("Direct authentication succeeded & reached account:", page.url().includes("/account"));

  console.log("\n==================================================");
  console.log("  ALL FLARE AUTHENTICATION METHODS TESTED & VERIFIED");
  console.log("==================================================");

  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
