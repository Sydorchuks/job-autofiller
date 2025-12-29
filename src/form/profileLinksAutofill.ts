import type { Page, ElementHandle } from "playwright";

type ProfileLinks = {
    github?: string;
    linkedin?: string;
    portfolio?: string;
};

const GITHUB_KEYWORDS = [
    "github",
    "git profile",
    "profil git",
    "git",
];

const LINKEDIN_KEYWORDS = [
    "linkedin",
];

const PORTFOLIO_KEYWORDS = [
    "portfolio",
    "website",
    "personal site",
    "homepage",
    "strona",
];

function normalize(v: string | null | undefined): string {
    return (v ?? "").toLowerCase().trim();
}

function includesAny(text: string, keys: string[]): boolean {
    return keys.some((k) => text.includes(k));
}

export async function profileLinksAutofill(
    page: Page,
    fields: ElementHandle<Element>[],
    profiles: ProfileLinks,
): Promise<void> {
    console.log("🔗 Profile links autofill started");

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

            if (tag !== "input" && tag !== "textarea") continue;
            if (type === "checkbox" || type === "radio") continue;

            // ===== GITHUB =====
            if (
                profiles.github &&
                includesAny(context, GITHUB_KEYWORDS)
            ) {
                await field.fill(profiles.github);
                console.log("[profile] github filled");
                continue;
            }

            // ===== LINKEDIN =====
            if (
                profiles.linkedin &&
                includesAny(context, LINKEDIN_KEYWORDS)
            ) {
                await field.fill(profiles.linkedin);
                console.log("[profile] linkedin filled");
                continue;
            }

            // ===== PORTFOLIO (fallback → github) =====
            if (
                includesAny(context, PORTFOLIO_KEYWORDS)
            ) {
                const value =
                    profiles.portfolio ||
                    profiles.github;

                if (value) {
                    await field.fill(value);
                    console.log("[profile] portfolio filled (fallback ok)");
                }
                continue;
            }
        } catch (e) {
            console.warn("⚠️ Profile links skipped field:", e);
        }
    }

    console.log("✅ Profile links autofill done");
}
