import { runEngine } from "./engine/runner/runEngine";
import { createSession } from "./engine/session";

const session = createSession({
  mode: "interactive", // або "auto"
  urls: [
    "https://santanderbp.wd502.myworkdayjobs.com/pl-PL/Kariera/job/Pozna%C5%84/specjalista--ka--relacji-z-klientem-Strefy-Santander_Req1509539-1/apply/applyManually?source=PL_Pracuj",
  ],
});

runEngine(session).catch((err) => {
  console.error("❌ Engine crashed:", err);
});
