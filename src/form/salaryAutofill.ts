import type { Page, ElementHandle } from "playwright";
import { SalaryCurrency, SalaryPeriod } from "../domain/salary";

type SalaryProfile = Record<
    SalaryCurrency,
    Record<SalaryPeriod, number>
>;

type ParsedSalaryOption = {
    raw: string;
    min: number;
    max: number;
    currency?: SalaryCurrency;
    period?: SalaryPeriod;
};

const SALARY_KEYWORDS = [
    "salary",
    "pay",
    "rate",
    "wynagrodzenie",
    "oczekiwania",
    "financial",
    "compensation",
];

const CURRENCY_KEYWORDS: Record<SalaryCurrency, string[]> = {
    [SalaryCurrency.PLN]: ["pln", "zł", "zl"],
    [SalaryCurrency.EUR]: ["eur", "€"],
    [SalaryCurrency.USD]: ["usd", "$"],
    [SalaryCurrency.UAH]: ["uah", "₴", "грн"],
};

const PERIOD_KEYWORDS: Record<SalaryPeriod, string[]> = {
    [SalaryPeriod.HOURLY]: ["hour", "/h", "per hour", "godzin"],
    [SalaryPeriod.MONTHLY]: ["month", "monthly", "mies"],
    [SalaryPeriod.YEARLY]: ["year", "annual", "rok"],
};

function normalize(v: string | null | undefined): string {
    return (v ?? "").toLowerCase().trim();
}

function includesAny(text: string, keys: string[]): boolean {
    return keys.some((k) => text.includes(k));
}

function detectCurrency(text: string): SalaryCurrency | null {
    for (const [cur, keys] of Object.entries(CURRENCY_KEYWORDS) as [
        SalaryCurrency,
        string[]
    ][]) {
        if (includesAny(text, keys)) return cur;
    }
    return null;
}

function detectPeriod(text: string): SalaryPeriod | null {
    for (const [p, keys] of Object.entries(PERIOD_KEYWORDS) as [
        SalaryPeriod,
        string[]
    ][]) {
        if (includesAny(text, keys)) return p;
    }
    return null;
}

function detectSalaryContext(text: string): boolean {
    return includesAny(text, SALARY_KEYWORDS);
}

/**
 * Парсить:
 *  - 30
 *  - 30-39
 *  - 30 – 39
 *  - 40+
 */
function parseSalaryOption(text: string): ParsedSalaryOption | null {
    const t = normalize(text);

    const range = t.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) {
        return {
            raw: text,
            min: Number(range[1]),
            max: Number(range[2]),
            currency: detectCurrency(t) ?? undefined,
            period: detectPeriod(t) ?? undefined,
        };
    }

    const single = t.match(/(\d+)/);
    if (single) {
        const val = Number(single[1]);
        return {
            raw: text,
            min: val,
            max: val,
            currency: detectCurrency(t) ?? undefined,
            period: detectPeriod(t) ?? undefined,
        };
    }

    return null;
}

function pickBestOption(
    options: ParsedSalaryOption[],
    target: number
): ParsedSalaryOption | null {
    if (options.length === 0) return null;

    // 1️⃣ exact range hit
    const exact = options.find(
        (o) => target >= o.min && target <= o.max
    );
    if (exact) return exact;

    // 2️⃣ closest distance
    let best: ParsedSalaryOption | null = null;
    let bestDistance = Infinity;

    for (const o of options) {
        const dist =
            target < o.min
                ? o.min - target
                : target > o.max
                ? target - o.max
                : 0;

        if (dist < bestDistance) {
            bestDistance = dist;
            best = o;
        }
    }

    return best;
}

export async function salaryAutofill(
    page: Page,
    fields: ElementHandle<Element>[],
    salaryProfile: SalaryProfile
): Promise<void> {
    console.log("💰 Salary autofill started");

    for (const field of fields) {
        try {
            const tag = await field.evaluate((el) => el.tagName.toLowerCase());
            const type = normalize(await field.getAttribute("type"));
            const name = normalize(await field.getAttribute("name"));
            const id = normalize(await field.getAttribute("id"));
            const placeholder = normalize(await field.getAttribute("placeholder"));
            const ariaLabel = normalize(await field.getAttribute("aria-label"));

            let labelText = "";
            if (id) {
                const label = await page.$(`label[for="${id}"]`);
                if (label) labelText = normalize(await label.innerText());
            }

            const context = `${name} ${id} ${placeholder} ${ariaLabel} ${labelText}`;
            if (!detectSalaryContext(context)) continue;

            const currency =
                detectCurrency(context) ?? SalaryCurrency.PLN;
            const period =
                detectPeriod(context) ?? SalaryPeriod.HOURLY;

            const targetValue =
                salaryProfile[currency]?.[period];

            if (!targetValue) continue;

            const isSelectized =
                id.endsWith("-selectized") ||
                placeholder.includes("kliknij") ||
                placeholder.includes("choose");

            // ===== SELECT / SELECTIZED =====
            if (isSelectized || tag === "select") {
                console.log("[salary] select/selectized detected");

                await field.click();

                const options = page.locator(
                    '[role="option"], .selectize-dropdown .option, option'
                );

                const count = await options.count();
                if (count === 0) {
                    console.log("[salary] dropdown empty");
                    continue;
                }

                const parsed: ParsedSalaryOption[] = [];

                for (let i = 0; i < count; i++) {
                    const text = await options.nth(i).innerText();
                    const opt = parseSalaryOption(text);
                    if (!opt) continue;
                    parsed.push(opt);
                }

                const chosen = pickBestOption(parsed, targetValue);

                if (!chosen) {
                    console.log("[salary] no suitable option found");
                    continue;
                }

                console.log(
                    `[salary] choosing "${chosen.raw}" for target ${targetValue}`
                );

                await options
                    .filter({ hasText: chosen.raw })
                    .first()
                    .click();

                continue;
            }

            // ===== REAL INPUT =====
            if (tag === "input" && type !== "checkbox") {
                await field.fill(String(targetValue));
                console.log("[salary] input filled:", targetValue);
            }
        } catch (e) {
            console.warn("⚠️ Salary autofill skipped field:", e);
        }
    }

    console.log("✅ Salary autofill done");
}
