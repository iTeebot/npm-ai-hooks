import type { Provider, ProviderModels } from "../types";

// Provider display names
export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini",
  groq: "Groq",
  deepseek: "DeepSeek",
  xai: "xAI",
  mistral: "Mistral",
  perplexity: "Perplexity",
  openrouter: "OpenRouter"
};

// Get all available models for a provider
export function getProviderModels(provider: Provider): string[] {
  // These are the actual model types from the library
  const modelMap: Record<Provider, string[]> = {
    openai: [
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo"
    ],
    claude: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307"
    ],
    gemini: [
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-thinking-exp-01-21",
      "gemini-exp-1206",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b"
    ],
    groq: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ],
    deepseek: [
      "deepseek-chat",
      "deepseek-reasoner"
    ],
    xai: [
      "grok-4-0131",
      "grok-beta",
      "grok-2-1212"
    ],
    mistral: [
      "mistral-large-latest",
      "mistral-small-latest",
      "pixtral-large-latest",
      "ministral-8b-latest",
      "mistral-nemo"
    ],
    perplexity: [
      "llama-3.1-sonar-large-128k-online",
      "llama-3.1-sonar-small-128k-online",
      "llama-3.1-sonar-large-128k-chat",
      "llama-3.1-sonar-small-128k-chat"
    ],
    openrouter: [
      "openai/gpt-4o",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-2.0-flash-exp",
      "meta-llama/llama-3.3-70b-instruct",
      "deepseek/deepseek-chat"
    ]
  };

  return modelMap[provider] || [];
}

// Get all supported providers
export function getAllProviders(): Provider[] {
  return Object.keys(PROVIDER_NAMES) as Provider[];
}

// Get provider info
export interface ProviderInfo {
  key: Provider;
  name: string;
  models: string[];
}

export function getProviderInfo(provider: Provider): ProviderInfo {
  return {
    key: provider,
    name: PROVIDER_NAMES[provider],
    models: getProviderModels(provider)
  };
}

export function getAllProviderInfo(): ProviderInfo[] {
  return getAllProviders().map(getProviderInfo);
}

