import type { Page } from "playwright";

const NEXT_BUTTON_SELECTORS = [
  'button:has-text("Next")',
  'button:has-text("Continue")',
  'button:has-text("Dalej")',
  'button:has-text("Weiter")',
  'button:has-text("Continue application")',
  '[type="button"]:has-text("Next")',
  '[type="submit"]:has-text("Next")',
];

export async function goToNextPageIfExists(
  page: Page
): Promise<boolean> {
  for (const selector of NEXT_BUTTON_SELECTORS) {
    const button = page.locator(selector).first();

    if (await button.count()) {
      const visible = await button.isVisible().catch(() => false);
      const enabled = await button.isEnabled().catch(() => false);

      if (visible && enabled) {
        console.log("➡️ Multi-page: clicking NEXT");
        await button.scrollIntoViewIfNeeded();
        await button.click();
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(500);
        return true;
      }
    }
  }

  return false;
}
