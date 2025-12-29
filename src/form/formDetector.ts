import type { Page, ElementHandle } from "playwright";
import { SemanticField, SemanticRole, ControlType } from "./types";

export type RawField = {
    tag: string;
    type?: string | null;
    id?: string | null;
    name?: string | null;
    placeholder?: string | null;
    ariaLabel?: string | null;
    labelText?: string | null;
};

const ROLE_KEYWORDS: Record<string, SemanticRole> = {
    // identity
    first: "firstName",
    name: "firstName",
    last: "lastName",
    surname: "lastName",
    email: "email",
    mail: "email",
    phone: "phone",
    telefon: "phone",

    // 🔥 AVAILABILITY (notice / start / availability)
    availability: "availability",
    notice: "availability",
    "notice period": "availability",
    wypowiedzenia: "availability",
    dostępność: "availability",
    "od kiedy": "availability",
    "kiedy możesz": "availability",
    "when can you start": "availability",
    "start date": "availability",
    "start work": "availability",

    // salary
    salary: "salary",
    wynagrodzenie: "salary",
    earnings: "salary",

    // profiles
    git: "profileGit",
    github: "profileGit",
    linkedin: "profileLinkedIn",

    // resume
    cv: "resume",
    resume: "resume",
};


function detectSemanticRole(labelText?: string | null): SemanticRole {
    if (!labelText) return "unknown";

    const normalized = labelText.toLowerCase();
    for (const key in ROLE_KEYWORDS) {
        if (normalized.includes(key)) return ROLE_KEYWORDS[key];
    }
    return "unknown";
}

function detectControlType(
    tag: string,
    type?: string | null,
    id?: string | null
): ControlType {
    if (tag === "textarea") return "textarea";
    if (type === "file") return "file";
    if (type === "checkbox") return "checkbox";
    if (id?.endsWith("-selectized")) return "selectized";
    if (tag === "select") return "select";
    return "input";
}

/**
 * 🔑 ГОЛОВНА ФУНКЦІЯ
 */
export async function detectAndDumpForm(page: Page): Promise<{
    elements: ElementHandle<Element>[];
    fields: RawField[];
}> {
    console.log("\n🔍 Detecting form...");

    const elements = await page.$$("input, textarea, select");
    const fields: RawField[] = [];

    console.log(`\n✅ Found ${elements.length} fields:\n`);

    for (const el of elements) {
        const tag = await el.evaluate((e) => e.tagName.toLowerCase());
        const type = await el.getAttribute("type");
        const name = await el.getAttribute("name");
        const id = await el.getAttribute("id");
        const placeholder = await el.getAttribute("placeholder");
        const ariaLabel = await el.getAttribute("aria-label");

        let labelText: string | null = null;
        if (id) {
            const label = await page.$(`label[for="${id}"]`);
            if (label) labelText = await label.innerText();
        }

        const field: RawField = {
            tag,
            type,
            name,
            id,
            placeholder,
            ariaLabel,
            labelText,
        };

        console.log(field);
        fields.push(field);
    }

    return { elements, fields };
}

/**
 * 🔑 SEMANTIC LAYER
 */
export async function detectSemanticForm(
    page: Page
): Promise<SemanticField[]> {
    const { fields } = await detectAndDumpForm(page);

    const semanticFields: SemanticField[] = fields.map((field) => ({
        id: field.id ?? "",
        role: detectSemanticRole(field.labelText),
        controlType: detectControlType(
            field.tag,
            field.type,
            field.id
        ),
    }));

    console.log("\n🧠 Semantic fields:");
    for (const f of semanticFields) {
        console.log(`- ${f.role} (${f.controlType}) -> ${f.id}`);
    }

    return semanticFields;
}
