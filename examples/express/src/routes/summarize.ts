import { Router, Request, Response } from "express";
import { initAIHooks } from "npm-ai-hooks";
import { wrap } from "npm-ai-hooks";
// Note: If running locally with a .env file, ensure you install dotenv and uncomment:
// import * as dotenv from "dotenv";
// dotenv.config();

// Initialize providers with environment variables
const providers: Array<{ provider: 'openai' | 'groq' | 'claude' | 'gemini' | 'openrouter'; key: string; defaultModel?: string }> = [];

if (process.env.OPENAI_KEY) {
  providers.push({
    provider: 'openai',
    key: process.env.OPENAI_KEY,
    defaultModel: 'gpt-4o'
  });
}

if (process.env.GROQ_KEY) {
  providers.push({
    provider: 'groq',
    key: process.env.GROQ_KEY,
    defaultModel: 'llama-3.1-70b-versatile'
  });
}

if (process.env.CLAUDE_KEY) {
  providers.push({
    provider: 'claude',
    key: process.env.CLAUDE_KEY,
    defaultModel: 'claude-3-5-sonnet-20241022'
  });
}

if (process.env.GEMINI_KEY) {
  providers.push({
    provider: 'gemini',
    key: process.env.GEMINI_KEY
  });
}

if (process.env.OPENROUTER_KEY) {
  providers.push({
    provider: 'openrouter',
    key: process.env.OPENROUTER_KEY,
    defaultModel: 'openai/gpt-4o-mini'
  });
}

// Initialize with available providers
if (providers.length > 0) {
  initAIHooks({
    providers,
    defaultProvider: 'gemini'
  });
  console.log(`✅ Initialized ${providers.length} AI providers for Express server`);
} else {
  console.log('⚠️  No API keys found. Please set up your .env file with API keys.');
}

const router = Router();
const summarize = wrap((text: string) => text, { task: "summarize" });

router.get("/", async (req: Request, res: Response) => {
  try {
    const text = req.query.text as string;
    
    if (!text) {
      return res.status(400).json({ 
        error: "Missing text parameter",
        example: "/summarize?text=Your long text here..."
      });
    }
    
    const result = await summarize(text);
    return res.json({
      summary: result.output,
      meta: result.meta
    });
  } catch (error: unknown) {
    const err = error as Error & { provider?: string };
    console.error("Summarize Error:", err);
    return res.status(500).json({
      error: err.message || "Internal Server Error",
      provider: err.provider || null
    });
  }
});

export default router;