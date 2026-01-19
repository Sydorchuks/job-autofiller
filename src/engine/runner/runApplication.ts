import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { openBrowser } from "../../browser/openBrowser";
import {
  detectAndDumpForm,
  detectSemanticForm,
} from "../../form/formDetector";

import { autofillStandardFields } from "../../form/standartAutofill";
import { profileLinksAutofill } from "../../form/profileLinksAutofill";
import { autofillAvailability } from "../../form/availabilityAutofill";
import { autofillLocation } from "../../form/locationAutofill";
import { salaryAutofill } from "../../form/salaryAutofill";
import { autofillLanguages } from "../../form/languageAutofill";

import { profile } from "../../config/profile";
import { goToNextPageIfExists } from "./multiPage";

export async function runApplication(url: string): Promise<void> {
  const rl = createInterface({ input, output });

  console.log(`\n🔗 Opening: ${url}`);

  const { page } = await openBrowser();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  console.log("👉 Log in manually if needed.");
  await rl.question("Press ENTER when application form is visible...");

  let pageIndex = 1;

  while (true) {
    console.log(`\n📄 Filling page ${pageIndex}`);

    const { elements: rawElements } = await detectAndDumpForm(page);
    const semanticFields = await detectSemanticForm(page);

    await autofillStandardFields(page, rawElements, profile);
    await profileLinksAutofill(page, rawElements, profile.profiles);
    await autofillAvailability(page, semanticFields);
    await autofillLocation(page, semanticFields, profile.location);
    await salaryAutofill(page, rawElements, profile.salary);
    await autofillLanguages(page, semanticFields, profile.languages);

    const hasNext = await goToNextPageIfExists(page);

    if (!hasNext) {
      console.log("🛑 No NEXT page detected");
      break;
    }

    pageIndex++;
  }

  console.log("🟡 Review the form manually before submit.");
}
