import { BrowserContext } from "playwright";
import userSignal from "../input/userSignal";

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

export async function runApplication(
  context: BrowserContext,
  url: string,
  jobId: number
): Promise<void> {
  const page = await context.newPage();

  console.log(`🔗 [${jobId}] Opening: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  console.log(`⏸️ [${jobId}] Waiting for ENTER`);
  await userSignal.wait();

  let pageIndex = 1;

  while (true) {
    console.log(`📄 [${jobId}] Filling page ${pageIndex}`);

    const { elements: rawElements } = await detectAndDumpForm(page);
    const semanticFields = await detectSemanticForm(page);

    await autofillStandardFields(page, rawElements, profile);
    await profileLinksAutofill(page, rawElements, profile.profiles);
    await autofillAvailability(page, semanticFields);
    await autofillLocation(page, semanticFields, profile.location);
    await salaryAutofill(page, rawElements, profile.salary);
    await autofillLanguages(page, semanticFields, profile.languages);

    const hasNext = await goToNextPageIfExists(page);
    if (!hasNext) break;

    pageIndex++;
  }

  console.log(`✅ [${jobId}] Done`);
}
