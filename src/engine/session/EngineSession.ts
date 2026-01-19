export type EngineMode = "auto" | "interactive";

export type EngineSession = {
  mode: EngineMode;
  urls: string[];
  currentIndex: number;
};
