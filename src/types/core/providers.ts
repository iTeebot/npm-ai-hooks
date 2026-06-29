import { Provider, ProviderModels } from "../index";

export interface ProviderFunction<P extends Provider = Provider> {
  (prompt: string, model: ProviderModels[P]): Promise<string>;
}

export interface ProviderMap {
  openrouter: ProviderFunction<"openrouter">;
  groq: ProviderFunction<"groq">;
  openai: ProviderFunction<"openai">;
  gemini: ProviderFunction<"gemini">;
  claude: ProviderFunction<"claude">;
  deepseek: ProviderFunction<"deepseek">;
  xai: ProviderFunction<"xai">;
  perplexity: ProviderFunction<"perplexity">;
  mistral: ProviderFunction<"mistral">;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock: ProviderFunction<any>; // generic fallback for mock
}
