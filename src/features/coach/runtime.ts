// On-device LLM rephrase seam.
//
// The deterministic TemplateCoach always produces the text and every number in it. An
// optional on-device model can REPHRASE that text more warmly, but is contractually
// forbidden from changing any figure, name, or date. This is the verified-safe pattern:
// language from the model, numbers from the engine, and full graceful degradation.
//
// To enable it, register a rephraser at startup with setLlmRephraser, backed by a native
// module in a dev client:
//   - iOS 26+:   Apple Foundation Models (Swift) via an Expo module
//   - Android:   ML Kit GenAI Prompt API / Gemini Nano (Kotlin) via AICore
// The rephraser's prompt must instruct the model to keep all numbers and dates exactly as
// given. When no rephraser is registered, the deterministic text ships unchanged.

export interface LlmRephraser {
  /** Rephrase text warmly without altering any number, name, or date. */
  rephrase(text: string): Promise<string>;
}

let rephraser: LlmRephraser | null = null;

export function setLlmRephraser(next: LlmRephraser | null): void {
  rephraser = next;
}

export function getLlmRephraser(): LlmRephraser | null {
  return rephraser;
}

/** True once a working on-device rephraser has been registered by the native adapter. */
export function isOnDeviceLlmAvailable(): boolean {
  return rephraser !== null;
}
