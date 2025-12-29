import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { openBrowser } from "../browser/openBrowser";

// detector
import {
    detectAndDumpForm,
    detectSemanticForm,
} from "../form/formDetector";

// autofill-и
import { autofillStandardFields } from "../form/standartAutofill";
import { profileLinksAutofill } from "../form/profileLinksAutofill";
import { autofillAvailability } from "../form/availabilityAutofill";

import { profile } from "../config/profile";
import { salaryAutofill } from "../form/salaryAutofill";

export async function runEngine(): Promise<void> {
    const rl = createInterface({ input, output });

    console.log("=== Job Automation Engine (READ-ONLY) ===");

    const url = await rl.question("Paste job application URL: ");
    console.log("Opening:", url);

    const { page } = await openBrowser();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("\n👉 Log in manually if needed.");
    await rl.question("Press ENTER when application form is visible...");

    /**
     * 1️⃣ RAW fields (старий світ)
     */
    const { elements: rawElements } = await detectAndDumpForm(page);

    /**
     * 2️⃣ SEMANTIC fields (новий світ)
     */
    const semanticFields = await detectSemanticForm(page);

    /**
     * 3️⃣ STANDARD AUTOFILL (RAW)
     */
    await autofillStandardFields(page, rawElements, profile);

    /**
     * 4️⃣ PROFILE LINKS (RAW)
     */
    await profileLinksAutofill(page, rawElements, profile.profiles);

    /**
     * 5️⃣ AVAILABILITY (SEMANTIC)
     */
    await autofillAvailability(page, semanticFields);

    await salaryAutofill(page, rawElements, profile.salary)

    console.log("\n🟡 Review the form manually before submit.");
}
