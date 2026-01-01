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
import { autofillLocation } from "../form/locationAutofill";
import { autofillLanguages } from "../form/languageAutofill";

export async function runEngine(): Promise<void> {
    const rl = createInterface({ input, output });

    console.log("=== Job Automation Engine (READ-ONLY) ===");

    const url = await rl.question("Paste job application URL: ");
    console.log("Opening:", url);

    const { page } = await openBrowser();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("\n👉 Log in manually if needed.");
    await rl.question("Press ENTER when application form is visible...");

    const { elements: rawElements } = await detectAndDumpForm(page);

    const semanticFields = await detectSemanticForm(page);
    await autofillStandardFields(page, rawElements, profile);
    await profileLinksAutofill(page, rawElements, profile.profiles);
    await autofillAvailability(page, semanticFields);
    await autofillLocation(page, semanticFields, profile.location);
    await salaryAutofill(page, rawElements, profile.salary);
    await autofillLanguages(page, semanticFields, profile.languages)

    console.log("\n🟡 Review the form manually before submit.");
}
