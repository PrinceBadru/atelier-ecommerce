import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // 1. Login Page Preview
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "C:/Users/user/.gemini/antigravity/brain/7b5671b5-3c2f-41e3-acc5-d1f517105d8b/login-flare-preview.png",
    fullPage: true,
  });

  // 2. Register Page with Password Rules
  await page.goto("https://atelier-web-5swv.onrender.com/register", { waitUntil: "networkidle" });
  await page.fill("#register-password", "AtelierCraft2026!");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "C:/Users/user/.gemini/antigravity/brain/7b5671b5-3c2f-41e3-acc5-d1f517105d8b/register-flare-preview.png",
    fullPage: true,
  });

  // 3. Two-Factor Page Preview
  await page.goto("https://atelier-web-5swv.onrender.com/two-factor", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "C:/Users/user/.gemini/antigravity/brain/7b5671b5-3c2f-41e3-acc5-d1f517105d8b/two-factor-flare-preview.png",
    fullPage: true,
  });

  // 4. Account Portal with Passkeys and 2FA
  await page.goto("https://atelier-web-5swv.onrender.com/login", { waitUntil: "networkidle" });
  await page.locator('button:has-text("Shopper Demo")').click();
  await page.waitForTimeout(2000);
  await page.goto("https://atelier-web-5swv.onrender.com/account", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "C:/Users/user/.gemini/antigravity/brain/7b5671b5-3c2f-41e3-acc5-d1f517105d8b/account-security-flare-preview.png",
    fullPage: true,
  });

  await browser.close();
  console.log("All visual evidence screenshots captured successfully!");
}

main().catch(console.error);
