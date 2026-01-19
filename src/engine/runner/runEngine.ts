import type { EngineSession } from "../session/EngineSession";
import { runApplication } from "./runApplication";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function runEngine(
  session: EngineSession
): Promise<void> {
  console.log("=== Job Automation Engine ===");
  console.log(`Mode: ${session.mode}`);
  console.log(`Total URLs: ${session.urls.length}`);

  while (session.currentIndex < session.urls.length) {
    const url = session.urls[session.currentIndex];

    console.log(
      `\n▶️ [${session.currentIndex + 1}/${session.urls.length}]`
    );

    await runApplication(url);

    session.currentIndex++;

    if (session.mode === "interactive") {
      const rl = createInterface({ input, output });
      await rl.question("➡️ Press ENTER to continue...");
    }
  }

  console.log("\n✅ Session finished");
}
