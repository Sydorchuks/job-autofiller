import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import userSignal from "./userSignal";

export function initGlobalInput() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  rl.on("line", () => {
    userSignal.trigger();
  });
}
