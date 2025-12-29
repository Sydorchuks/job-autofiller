import { Page, Locator } from "playwright";

export type SelectStrategy =
    | { type: "match-any"; keywords: string[] }
    | { type: "shortest" }
    | { type: "first" };

interface Params {
    page: Page;
    field: Locator;
    strategy: SelectStrategy;
}

/**
 * Universal dropdown handler for:
 * - selectize
 * - combobox
 * - role=listbox
 *
 * IMPORTANT:
 * - dropdown appears ONLY after typing for many UIs
 * - this function ASSUMES dropdown already exists
 */
export async function selectFromDropdown({
    page,
    field,
    strategy
}: Params): Promise<boolean> {
    try {
        const dropdown = page
            .locator('[role="listbox"], .selectize-dropdown, .dropdown-menu')
            .filter({ has: page.locator(":visible") })
            .first();

        const dropdownVisible = await dropdown.isVisible().catch(() => false);
        if (!dropdownVisible) {
            return false;
        }

        const options = dropdown.locator(
            '[role="option"], .option, li, div'
        );

        const count = await options.count();
        if (count === 0) {
            return false;
        }

        const optionTexts: { index: number; text: string }[] = [];

        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).innerText()).trim();
            if (text.length > 0) {
                optionTexts.push({ index: i, text });
            }
        }

        if (optionTexts.length === 0) {
            return false;
        }

        let chosenIndex: number | null = null;

        if (strategy.type === "match-any") {
            const keywords = strategy.keywords.map((k) => k.toLowerCase());
            for (const opt of optionTexts) {
                const norm = opt.text.toLowerCase();
                if (keywords.some((k) => norm.includes(k))) {
                    chosenIndex = opt.index;
                    break;
                }
            }
        }

        if (strategy.type === "shortest") {
            chosenIndex = optionTexts.reduce((a, b) =>
                a.text.length <= b.text.length ? a : b
            ).index;
        }

        if (strategy.type === "first") {
            chosenIndex = optionTexts[0].index;
        }

        if (chosenIndex === null) {
            return false;
        }

        await options.nth(chosenIndex).click({ timeout: 2000 });
        return true;
    } catch {
        return false;
    }
}
