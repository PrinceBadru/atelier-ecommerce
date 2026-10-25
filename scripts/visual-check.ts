import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1400, height: 2800 }
  });

  console.log("Navigating to http://localhost:3001/products...");
  await page.goto("http://localhost:3001/products", { waitUntil: "networkidle" });

  const screenshotPath = "C:\\Users\\user\\.gemini\\antigravity\\brain\\7b5671b5-3c2f-41e3-acc5-d1f517105d8b\\catalog_page_1.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Saved full catalog screenshot to", screenshotPath);

  // Also query the products and their image URLs on the page
  const items = await page.$$eval("[data-product-card], a[href^='/products/']", (cards) => {
    return cards.slice(0, 30).map((c) => {
      const title = c.querySelector("h3, [class*='font-medium'], [class*='font-serif']")?.textContent?.trim();
      const img = c.querySelector("img")?.src;
      return { title, img };
    }).filter(x => x.title && x.img);
  });

  console.log("Found items on page:", JSON.stringify(items, null, 2));

  await browser.close();
}

main().catch(console.error);
