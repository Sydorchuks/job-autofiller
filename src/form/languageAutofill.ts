import type { Page } from "playwright";
import type { SemanticField } from "./types";

/* ================= TYPES ================= */

export type LanguageLevel =
    | "native"
    | "c2"
    | "c1"
    | "b2"
    | "b1"
    | "a2"
    | "a1";

export type LanguageProfile = {
    name: string;
    level: LanguageLevel;
};

/* ================= UTILS ================= */

function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function languageMatchesField(language: string, fieldId: string): boolean {
    const l = normalize(language);
    const id = normalize(fieldId);

    if (l === "polish") return id.includes("1725");
    if (l === "english") return id.includes("1726");
    if (l === "german") return id.includes("1727");

    return false;
}

function levelKeywords(level: LanguageLevel): string[] {
    switch (level) {
        case "native": return ["native", "ojczysty"];
        case "c2": return ["c2"];
        case "c1": return ["c1"];
        case "b2": return ["b2"];
        case "b1": return ["b1"];
        case "a2": return ["a2"];
        case "a1": return ["a1"];
    }
}

/* ================= MAIN ================= */

export async function autofillLanguages(
    page: Page,
    semanticFields: SemanticField[],
    languages: LanguageProfile[]
): Promise<void> {
    console.log("🌍 Language autofill started");

    const languageFields = semanticFields.filter(
        f => f.controlType === "selectized"
    );

    for (const lang of languages) {
        const field = languageFields.find(f =>
            languageMatchesField(lang.name, f.id)
        );

        if (!field) {
            console.log(`[language] field not found for ${lang.name}`);
            continue;
        }

        const input = page.locator(`#${field.id}`);

        try {
            console.log(`[language] setting ${lang.name} → ${lang.level}`);

            await input.scrollIntoViewIfNeeded();
            await input.click();
            await page.waitForTimeout(300);

            const dropdown = page
                .locator('[role="listbox"], .selectize-dropdown')
                .filter({ has: page.locator(":visible") })
                .first();

            const options = dropdown.locator('[role="option"], .option');
            const count = await options.count();

            let chosen = false;

            for (let i = 0; i < count; i++) {
                const text = normalize(await options.nth(i).innerText());

                if (levelKeywords(lang.level).some(k => text.includes(k))) {
                    await options.nth(i).click();
                    await page.waitForTimeout(300);
                    chosen = true;
                    break;
                }
            }

            if (!chosen) {
                console.warn(`[language] level not found for ${lang.name}`);
                continue;
            }

            console.log(`[language] ${lang.name} set to ${lang.level}`);
        } catch (e) {
            console.warn(`⚠️ Language autofill failed for ${lang.name}`, e);
        }
    }

    console.log("✅ Language autofill done");
}
