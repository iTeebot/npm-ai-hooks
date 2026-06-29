import { wrap } from "../../src/wrap";

async function run() {
  // Wrong OpenRouter model
  try {
    const wrongOpenRouter = wrap((text: string) => text, { task: "summarize", provider: "openrouter", model: "invalid-model" as never });
    await wrongOpenRouter("Test text");
  } catch (err: unknown) {
    console.error("❌ OpenRouter error:", err);
  }

  // Wrong Groq model
  try {
    const wrongGroq = wrap((text: string) => text, { task: "explain", provider: "groq", model: "invalid-groq-model" as never });
    await wrongGroq("Test text");
  } catch (err: unknown) {
    console.error("❌ Groq error:", err);
  }
}

run();
