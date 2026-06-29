import { BaseProvider } from "./BaseProvider";
import { providerConfigs } from "./ProviderConfigs";
import { AIHookError } from "../../errors";

// Claude provider with custom auth headers
export class ClaudeProvider extends BaseProvider {
  constructor() {
    super(providerConfigs.claude);
  }

  protected buildAuthHeaders(apiKey: string): Record<string, string> {
    return {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    };
  }
}

// Gemini provider with custom URL and auth
export class GeminiProvider extends BaseProvider {
  constructor() {
    super(providerConfigs.gemini);
  }

  protected buildRequestConfig(prompt: string, model: string, apiKey: string) {
    const baseConfig = super.buildRequestConfig(prompt, model, apiKey);
    return {
      ...baseConfig,
      url: `${this.config.baseUrl}/${model}:generateContent?key=${apiKey}`,
      headers: {
        ...baseConfig.headers,
        // Remove Authorization header for Gemini
      }
    };
  }

  protected buildAuthHeaders(): Record<string, string> {
    return {}; // Gemini uses API key in URL
  }
}

// OpenRouter provider with custom error handling
export class OpenRouterProvider extends BaseProvider {
  constructor() {
    super(providerConfigs.openrouter);
  }

  protected handleHttpError(error: Error & {
    response: {
      status: number;
      statusText?: string;
      data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  }) {
    const status = error.response.status;
    const text = error.response.data?.error
      ? JSON.stringify(error.response.data.error)
      : error.response.statusText || "Unknown error";

    const providerName = this.config.name;

    if (status === 403) {
      return new AIHookError(
        "MODEL_NOT_ALLOWED",
        `Your API key cannot access this model: ${text}`,
        providerName,
        "Try a different model or check API key permissions"
      );
    }

    return super.handleHttpError(error);
  }
}
