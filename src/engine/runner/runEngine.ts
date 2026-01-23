import type { EngineSession } from "../session/EngineSession";
import { openBrowser } from "../../browser/openBrowser";
import { runApplication } from "./runApplication";
import { initGlobalInput } from "../input/globalInput";

export async function runEngine(
  session: EngineSession
): Promise<void> {
  console.log("=== Job Automation Engine ===");
  console.log(`Mode: ${session.mode}`);
  console.log(`Total URLs: ${session.urls.length}`);

  initGlobalInput();

  const { browser, context } = await openBrowser();

  const jobs = session.urls.map((url, index) =>
    runApplication(context, url, index + 1)
  );

  await Promise.all(jobs);

  console.log("🟡 Autofill finished. Review forms and submit manually.");

  await new Promise(() => {});
}
