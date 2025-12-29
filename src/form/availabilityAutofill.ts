import type { Page } from "playwright";
import type { SemanticField } from "./types";

type ParsedOption = {
    index: number;
    text: string;
    days: number;
};

function normalize(text: string): string {
    return text.toLowerCase().trim();
}

function parseToDays(text: string): number | null {
    const t = normalize(text);

    if (
        t.includes("asap") ||
        t.includes("immediate") ||
        t.includes("natychmiast") ||
        t.includes("od zaraz") ||
        t === "0" ||
        t === "none"
    ) {
        return 0;
    }

    const week = t.match(/(\d+)\s*(week|weeks|tydz)/);
    if (week) return Number(week[1]) * 7;

    const month = t.match(/(\d+)\s*(month|months|mies)/);
    if (month) return Number(month[1]) * 30;

    const day = t.match(/(\d+)\s*(day|days|dni)/);
    if (day) return Number(day[1]);

    return null;
}

export async function autofillAvailability(
    page: Page,
    semanticFields: SemanticField[]
): Promise<void> {
    console.log("⏳ Availability autofill started");

    const field = semanticFields.find(
        (f) => f.role === "availability"
    );

    if (!field) {
        console.log("ℹ️ No availability field (semantic)");
        return;
    }

    const input = page.locator(`#${field.id}`);

    // INPUT fallback
    if (field.controlType === "input" || field.controlType === "textarea") {
        await input.fill("ASAP");
        return;
    }

    // OPEN DROPDOWN
    await input.click({ timeout: 2000 });

    const dropdown = page
        .locator('[role="listbox"], .selectize-dropdown')
        .filter({ has: page.locator(":visible") })
        .first();

    if (!(await dropdown.isVisible().catch(() => false))) {
        console.warn("⚠️ Availability dropdown not visible");
        return;
    }

    // ❗❗❗ ONLY REAL OPTIONS — NO GENERIC DIV ❗❗❗
    const options = dropdown.locator(
        '[role="option"], .option'
    );

    const count = await options.count();
    if (count === 0) {
        console.warn("⚠️ No availability options");
        return;
    }

    const parsed: ParsedOption[] = [];

    for (let i = 0; i < count; i++) {
        const opt = options.nth(i);
        const text = (await opt.innerText()).trim();
        if (!text) continue;

        const days = parseToDays(text);
        if (days !== null) {
            parsed.push({ index: i, text, days });
        }
    }

    if (parsed.length === 0) {
        console.warn("⚠️ Availability options not parsable");
        return;
    }

    parsed.sort((a, b) => a.days - b.days);
    const chosen = parsed[0];

    console.log(
        `[availability] choosing "${chosen.text}" → ${chosen.days} days`
    );

    // CLICK EXACT OPTION
    await options.nth(chosen.index).click({ timeout: 2000 });

    await page.waitForTimeout(300);

    const finalValue = await input.inputValue().catch(() => "");
    console.log(`[availability] final value in field: "${finalValue}"`);
}
