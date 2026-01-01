import type { Page } from "playwright";
import type { SemanticField } from "./types";

type LocationProfile = {
    country: string;
    city: string;
};

function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function focusViaDOM(page: Page, selector: string) {
    await page.evaluate((sel) => {
        const el = document.querySelector<HTMLInputElement>(sel);
        if (!el) return;

        el.scrollIntoView({ block: "center", inline: "nearest" });
        el.focus();
    }, selector);

    await page.waitForTimeout(150);
}

export async function autofillLocation(
    page: Page,
    semanticFields: SemanticField[],
    profile: LocationProfile
): Promise<void> {
    console.log("📍 Location autofill started");

    const countryField = semanticFields.find(
        (f) => f.role === "locationCountry"
    );
    const cityField = semanticFields.find(
        (f) => f.role === "locationCity"
    );

    // ======================
    // 🌍 COUNTRY
    // ======================
    if (countryField) {
        const selector = `#${countryField.id}`;
        const input = page.locator(selector);

        try {
            const current = await input.inputValue();

            if (
                normalize(current) ===
                normalize(profile.country)
            ) {
                console.log(
                    "[location] country already set:",
                    current
                );
            } else {
                console.log(
                    "[location] setting country:",
                    profile.country
                );

                await focusViaDOM(page, selector);
                await input.fill(profile.country);
                await page.waitForTimeout(300);

                await input.press("Enter");
                await input.press("Tab");

                await page.waitForTimeout(300);

                console.log(
                    "[location] country committed:",
                    await input.inputValue()
                );
            }
        } catch (e) {
            console.warn("⚠️ Country autofill failed:", e);
        }
    }

    // ======================
    // 🏙 CITY (EXACT LOGIC)
    // ======================
    if (cityField) {
        const selector = `#${cityField.id}`;
        const input = page.locator(selector);

        const target = normalize(profile.city);

        try {
            console.log("[location] setting city:", profile.city);

            await focusViaDOM(page, selector);
            await input.fill(profile.city);
            await page.waitForTimeout(400);

            const dropdown = page
                .locator('[role="listbox"], .selectize-dropdown')
                .filter({ has: page.locator(":visible") })
                .first();

            const options = dropdown.locator(
                '[role="option"], .option'
            );

            const count = await options.count();
            if (count === 0) {
                console.warn(
                    "[location] city dropdown empty, skipping"
                );
                return;
            }

            let exact: number | null = null;
            let starts: number | null = null;

            for (let i = 0; i < count; i++) {
                const raw = await options.nth(i).innerText();
                const norm = normalize(raw);

                if (norm === target) {
                    exact = i;
                    break;
                }

                if (
                    starts === null &&
                    norm.startsWith(target)
                ) {
                    starts = i;
                }
            }

            const chosen = exact ?? starts;

            if (chosen === null) {
                console.warn(
                    "[location] no matching city option, skipping"
                );
                return;
            }

            const chosenText = await options
                .nth(chosen)
                .innerText();

            console.log(
                "[location] city chosen:",
                chosenText
            );

            await options.nth(chosen).click();
            await input.press("Enter");
            await input.press("Tab");

            await page.waitForTimeout(300);

            console.log(
                "[location] city committed:",
                await input.inputValue()
            );
        } catch (e) {
            console.warn("⚠️ City autofill failed:", e);
        }
    }
}
