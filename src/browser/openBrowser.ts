import { Browser, BrowserContext, chromium } from "playwright";

export async function openBrowser(): Promise<{
  browser: Browser;
  context: BrowserContext;
}> {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext();
  return { browser, context };
}
