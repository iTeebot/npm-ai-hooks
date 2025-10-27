import { OpenAIModel, OpenAIDefaultModel } from "./openai";
import { OpenRouterModel, OpenRouterDefaultModel } from "./openrouter";
import { GroqModel, GroqDefaultModel } from "./groq";
import { GeminiDefaultModel, GeminiModel } from "./gemini";
import { ClaudeDefaultModel, ClaudeModel } from "./claude";
import { DeepSeekDefaultModel, DeepSeekModel } from "./deepseek";
import { XAIDefaultModel, XAIModel } from "./xai";
import { PerplexityDefaultModel, PerplexityModel } from "./perplexity";
import { MistralDefaultModel, MistralModel } from "./mistral";

// Re-export model types
export type { OpenAIModel } from "./openai";
export type { OpenRouterModel } from "./openrouter";
export type { GroqModel } from "./groq";
export type { GeminiModel } from "./gemini";
export type { ClaudeModel } from "./claude";
export type { DeepSeekModel } from "./deepseek";
export type { XAIModel } from "./xai";
export type { PerplexityModel } from "./perplexity";
export type { MistralModel } from "./mistral";

export type Provider =  "openrouter" | "groq" | "openai" | "gemini" | "claude" | "deepseek" | "xai" | "perplexity" | "mistral";

export type ProviderModels = {
  openrouter: OpenRouterModel;
  groq: GroqModel;
  openai: OpenAIModel;
  gemini:GeminiModel;
  claude:ClaudeModel;
  deepseek:DeepSeekModel;
  xai:XAIModel;
  perplexity:PerplexityModel;
  mistral:MistralModel;
};

export const DEFAULT_MODEL: { [P in Provider]: ProviderModels[P] } = {
  openrouter: OpenRouterDefaultModel,
  groq: GroqDefaultModel,
  openai: OpenAIDefaultModel,
  gemini:GeminiDefaultModel,
  claude:ClaudeDefaultModel,
  deepseek:DeepSeekDefaultModel,
  xai:XAIDefaultModel,
  perplexity:PerplexityDefaultModel,
  mistral:MistralDefaultModel
};

// Task types
export type TaskType =
  | "summarize"
  | "translate"
  | "explain"
  | "rewrite"
  | "sentiment"
  | "codeReview";

// Wrap options
export type WrapOptions<P extends Provider | undefined = undefined> =
  | {
      provider: P extends Provider ? P : never;
      model?: P extends Provider ? ProviderModels[P] : never;
      task?: TaskType;
      targetLanguage?: string;
      customPrompt?: string;
    }
  | { 
      provider?: never; 
      model?: never; 
      task?: TaskType; 
      targetLanguage?: string;
      customPrompt?: string;
    };

