import type { Provider } from "../types";
import { BaseProvider } from "../providers/base/BaseProvider";
import { ClaudeProvider, GeminiProvider, OpenRouterProvider } from "../providers/base/SpecializedProviders";
import { providerConfigs } from "../providers/base/ProviderConfigs";

export interface KeyValidationResult {
  valid: boolean;
  provider: Provider;
  error?: string;
  message: string;
}

/**
 * Validates an API key by making a minimal test request to the provider
 */
export async function validateApiKey(provider: Provider, apiKey: string): Promise<KeyValidationResult> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      provider,
      error: 'EMPTY_KEY',
      message: 'API key is empty'
    };
  }

  try {
    let providerInstance: BaseProvider;

    // Create provider instance based on type
    switch (provider) {
      case 'claude':
        providerInstance = new ClaudeProvider();
        break;
      case 'gemini':
        providerInstance = new GeminiProvider();
        break;
      case 'openrouter':
        providerInstance = new OpenRouterProvider();
        break;
      default:
        const config = providerConfigs[provider];
        if (!config) {
          return {
            valid: false,
            provider,
            error: 'UNKNOWN_PROVIDER',
            message: `Unknown provider: ${provider}`
          };
        }
        providerInstance = new BaseProvider(config);
    }

    // Set the API key temporarily
    (providerInstance as any).apiKey = apiKey;

    // Make a minimal test request
    const testPrompt = "Hi";
    const testModel = getDefaultModel(provider);

    await providerInstance.call(testPrompt, testModel);

    return {
      valid: true,
      provider,
      message: 'API key is valid'
    };

  } catch (error: any) {
    // Check for common error types
    if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid API key')) {
      return {
        valid: false,
        provider,
        error: 'INVALID_KEY',
        message: 'API key is invalid or unauthorized'
      };
    }

    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      return {
        valid: false,
        provider,
        error: 'FORBIDDEN',
        message: 'API key does not have access to this resource'
      };
    }

    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      // Rate limit means the key is valid, just too many requests
      return {
        valid: true,
        provider,
        message: 'API key is valid (rate limited)'
      };
    }

    // If we get other errors, the key might still be valid (could be model/format issues)
    return {
      valid: true, // Assume valid unless we get clear auth error
      provider,
      message: 'API key appears valid (test request had non-auth error)'
    };
  }
}

/**
 * Validates multiple API keys
 */
export async function validateApiKeys(keys: Record<Provider, string>): Promise<Record<Provider, KeyValidationResult>> {
  const results: Partial<Record<Provider, KeyValidationResult>> = {};

  for (const [provider, key] of Object.entries(keys) as [Provider, string][]) {
    if (key && key.trim()) {
      results[provider] = await validateApiKey(provider, key);
    }
  }

  return results as Record<Provider, KeyValidationResult>;
}

/**
 * Get default model for a provider (for testing)
 */
function getDefaultModel(provider: Provider): string {
  const defaultModels: Record<Provider, string> = {
    openai: 'gpt-3.5-turbo',
    claude: 'claude-3-haiku-20240307',
    gemini: 'gemini-1.5-flash',
    groq: 'llama-3.1-8b-instant',
    deepseek: 'deepseek-chat',
    xai: 'grok-beta',
    mistral: 'mistral-small-latest',
    perplexity: 'llama-3.1-sonar-small-128k-chat',
    openrouter: 'openai/gpt-3.5-turbo'
  };

  return defaultModels[provider] || 'default';
}

/**
 * Quick check if API key format looks valid (doesn't make API call)
 */
export function quickValidateKeyFormat(provider: Provider, apiKey: string): KeyValidationResult {
  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      provider,
      error: 'EMPTY_KEY',
      message: 'API key is empty'
    };
  }

  // Check key format patterns
  const patterns: Record<Provider, RegExp> = {
    openai: /^sk-[a-zA-Z0-9-_]{20,}$/,
    claude: /^sk-ant-[a-zA-Z0-9-_]{20,}$/,
    gemini: /^AIza[a-zA-Z0-9-_]{35}$/,
    groq: /^gsk_[a-zA-Z0-9]{52}$/,
    deepseek: /^sk-[a-zA-Z0-9]{32}$/,
    xai: /^xai-[a-zA-Z0-9-_]{40,}$/,
    mistral: /^[a-zA-Z0-9]{32}$/,
    perplexity: /^pplx-[a-zA-Z0-9]{40}$/,
    openrouter: /^sk-or-v1-[a-zA-Z0-9]{64}$/
  };

  const pattern = patterns[provider];
  if (pattern && !pattern.test(apiKey)) {
    return {
      valid: false,
      provider,
      error: 'INVALID_FORMAT',
      message: `API key format doesn't match expected pattern for ${provider}`
    };
  }

  return {
    valid: true,
    provider,
    message: 'API key format looks valid'
  };
}

