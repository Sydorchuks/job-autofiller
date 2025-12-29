import type { Page, ElementHandle } from "playwright";
import { FIELD_ALIASES } from "../config/fieldAlisases"; 

function normalize(value: string | null | undefined): string {
    return (value ?? "").toLowerCase().trim();
}

function includesAny(haystack: string, needles: string[]): boolean {
    return needles.some((n) => haystack.includes(n));
}

export async function autofillStandardFields(
    page: Page,
    fields: ElementHandle<Element>[],
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        resumePath: string;
    }
): Promise<void> {
    console.log("✍️ Autofilling standard fields...");

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
                if (label) {
                    labelText = normalize(await label.innerText());
                }
            }

            const key = `${name} ${id} ${placeholder} ${ariaLabel} ${labelText}`;

            // ===== SKIP CHECKBOXES & RADIOS =====
            if (type === "checkbox" || type === "radio") {
                continue;
            }

            // ===== FILE UPLOAD =====
            if (type === "file") {
                console.log("📎 Uploading resume...");
                await field.setInputFiles(profile.resumePath);
                continue;
            }

            // ===== EMAIL =====
            if (includesAny(key, FIELD_ALIASES.email)) {
                await field.fill(profile.email);
                continue;
            }

            // ===== TEXT / TEXTAREA =====
            if (tag === "input" || tag === "textarea") {
                if (includesAny(key, FIELD_ALIASES.firstName)) {
                    await field.fill(profile.firstName);
                    continue;
                }

                if (includesAny(key, FIELD_ALIASES.lastName)) {
                    await field.fill(profile.lastName);
                    continue;
                }

                if (includesAny(key, FIELD_ALIASES.phone)) {
                    await field.fill(profile.phone);
                    continue;
                }
            }
        } catch (err) {
            console.warn("⚠️ Skipped field due to error:", err);
            continue;
        }
    }

    console.log("✅ Standard autofill done");
}
