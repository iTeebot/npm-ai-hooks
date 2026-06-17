import { AIHookError } from "../errors";
import { Provider } from "../types";
import { ProviderFunction } from "../types/core/providers";
import { ProviderMap } from "../types/core/providers";
import { providerRegistry } from "./base/ProviderRegistry";
import { providerConfigs } from "./base/ProviderConfigs";
import { BaseProvider } from "./base/BaseProvider";
import { ClaudeProvider, GeminiProvider, OpenRouterProvider } from "./base/SpecializedProviders";

// Import the new initialization system
import { 
  initAIHooks, 
  addProvider, 
  removeProvider, 
  getAvailableProviders as getNewAvailableProviders,
  getProvider as getNewProvider,
  getProviderChain as getNewProviderChain,
  isInitialized,
  reset,
  UserProviderConfig,
  ProviderInitializationOptions
} from "./init";

// Initialize all providers (legacy environment-based system)
function initializeProviders(): void {
  // Standard providers using BaseProvider
  const standardProviders = ['openai', 'groq', 'deepseek', 'mistral', 'xai', 'perplexity'] as const;
  
  standardProviders.forEach(providerName => {
    const config = providerConfigs[providerName];
    if (config) {
      const provider = new BaseProvider(config);
      providerRegistry.register(providerName as Provider, provider);
    }
  });

  // Specialized providers
  providerRegistry.register("claude", new ClaudeProvider());
  providerRegistry.register("gemini", new GeminiProvider());
  providerRegistry.register("openrouter", new OpenRouterProvider());
}

// Initialize providers on module load (legacy)
initializeProviders();

// Legacy compatibility - create the old provider map
const providers: ProviderMap = {
  openrouter: providerRegistry.get("openrouter")!,
  groq: providerRegistry.get("groq")!,
  openai: providerRegistry.get("openai")!,
  gemini: providerRegistry.get("gemini")!,
  claude: providerRegistry.get("claude")!,
  deepseek: providerRegistry.get("deepseek")!,
  xai: providerRegistry.get("xai")!,
  perplexity: providerRegistry.get("perplexity")!,
  mistral: providerRegistry.get("mistral")!,
  mock: async (prompt: string, model?: string) => `[MOCK OUTPUT] ${prompt}`
};

// Returns an array of providers whose API keys exist in environment (legacy)
export function getAvailableProviders(): Provider[] {
  // If new system is initialized, use it
  if (isInitialized()) {
    return getNewAvailableProviders();
  }
  
  // Otherwise use legacy system
  return providerRegistry.getAvailableProviders();
}

// Returns both the provider function and the actual provider name (legacy)
export function getProvider(name?: Provider): { fn: ProviderFunction<any>; provider: Provider | "mock" } {
  // If new system is initialized, use it
  if (isInitialized()) {
    const result = getNewProvider(name);
    return { fn: result.fn, provider: result.provider };
  }

  // Otherwise use legacy system
  const available = getAvailableProviders();

  // 1. If user specified provider and it's available
  if (name && providers[name]) {
    return { fn: providers[name], provider: name };
  }

  // 2. If at least one provider is available, pick the first one (openrouter always preferred if present)
  if (available.length > 0) {
    // Only log in non-test environments to avoid Jest warnings
    if (process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
      console.log(`[ai-hooks] ✅ Auto-selected provider: ${available[0]}`);
    }
    return { fn: providers[available[0]], provider: available[0] };
  }

  // 3. No valid keys found → throw error (single instruction, no fallback)
  throw new AIHookError(
    "NO_PROVIDER_FOUND",
    "No valid AI provider API key was found.\n\nIf you are using a .env file, please ensure you have installed the 'dotenv' package (npm i dotenv) and called require('dotenv').config() at the very top of your entry file.\n\nAlternatively, you can initialize providers explicitly:\ninitAIHooks({ providers: [{ provider: 'openai', key: 'your-key-here' }] })",
    undefined,
    "Reference documentation for setup instructions."
  );
}

// Returns the full ordered provider chain for fallback (new system only)
export function getProviderChain(name?: Provider): Array<{ fn: ProviderFunction<any>; provider: Provider }> {
  if (isInitialized()) {
    return getNewProviderChain(name);
  }

  // Legacy fallback: wrap available providers into a chain
  const available = getAvailableProviders() as Provider[];
  const seen = new Set<Provider>();
  const chain: Array<{ fn: ProviderFunction<any>; provider: Provider }> = [];

  const tryPush = (p: Provider) => {
    if (!seen.has(p) && providers[p]) {
      seen.add(p);
      chain.push({ fn: providers[p], provider: p });
    }
  };

  // Explicit name first
  if (name) tryPush(name);
  // OpenRouter preferred
  tryPush('openrouter');
  // Rest in availability order
  for (const p of available) tryPush(p);

  return chain;
}

// Export the new initialization system
export { 
  initAIHooks, 
  addProvider, 
  removeProvider, 
  isInitialized,
  reset,
  UserProviderConfig,
  ProviderInitializationOptions
};

// Export the registry for advanced usage (legacy)
export { providerRegistry };
