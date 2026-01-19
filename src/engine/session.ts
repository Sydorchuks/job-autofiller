import type { EngineSession, EngineMode } from "./session/EngineSession";

export function createSession(config: {
  mode: EngineMode;
  urls: string[];
}): EngineSession {
  if (!config.urls || config.urls.length === 0) {
    throw new Error("createSession: urls array is empty");
  }

  return {
    mode: config.mode,
    urls: config.urls,
    currentIndex: 0,
  };
}
