import { Browser, chromium, Page } from "playwright";


export async function openBrowser(): Promise<{
    browser: Browser;
    page: Page;
}> {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    return { browser, page };
}
