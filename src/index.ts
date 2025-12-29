import { runEngine } from "./engine/runEngine";

async function main(): Promise<void> {
    console.log("=== Job Automation Engine (READ-ONLY) ===");
    await runEngine();
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
