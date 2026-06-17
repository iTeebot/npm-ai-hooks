import { AIHookError } from "../../errors";

export interface FetchRequestConfig {
  url: string;
  method?: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface FetchResponse {
  data: any;
}

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  envKey: string;
  headers: Record<string, string>;
  requestBody: (prompt: string, model: string) => any;
  responseParser: (response: FetchResponse) => string;
  errorMessages: {
    missingKey: string;
    emptyResponse: string;
    badRequest: string;
    invalidKey: string;
    rateLimit: string;
    networkError: string;
    unknownError: string;
  };
}

export class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async call(prompt: string, model: string): Promise<string> {
    const apiKey = this.getApiKey();
    this.validateApiKey(apiKey);

    // At this point, apiKey is guaranteed to be defined due to validateApiKey
    const validatedApiKey = apiKey!;

    try {
      const requestConfig = this.buildRequestConfig(prompt, model, validatedApiKey);
      const response = await this.makeRequest(requestConfig);
      return this.parseResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected getApiKey(): string | undefined {
    // This method should be overridden by the provider creation logic
    // to return the explicitly provided API key instead of reading from process.env
    if (typeof process !== "undefined" && process.env) {
      return process.env[this.config.envKey];
    }
    return undefined;
  }

  protected validateApiKey(apiKey: string | undefined): void {
    if (!apiKey) {
      throw new AIHookError(
        "INVALID_API_KEY",
        this.config.errorMessages.missingKey,
        this.config.name,
        `Set ${this.config.envKey} in your environment variables.`
      );
    }
  }

  protected buildRequestConfig(prompt: string, model: string, apiKey: string): FetchRequestConfig {
    return {
      url: this.config.baseUrl,
      method: "POST",
      data: this.config.requestBody(prompt, model),
      headers: {
        ...this.config.headers,
        ...this.buildAuthHeaders(apiKey)
      }
    };
  }

  protected buildAuthHeaders(apiKey: string): Record<string, string> {
    return {
      "Authorization": `Bearer ${apiKey}`
    };
  }

  protected async makeRequest(config: FetchRequestConfig): Promise<FetchResponse> {
    try {
      const response = await fetch(config.url, {
        method: config.method || "POST",
        headers: config.headers as any,
        body: config.data ? JSON.stringify(config.data) : undefined,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }

      if (!response.ok) {
        // Emulate axios error shape for the error handler
        throw Object.assign(new Error(`Request failed with status code ${response.status}`), {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: data
          }
        });
      }

      return { data };
    } catch (error: any) {
      // If it's already an HTTP error we just threw, rethrow it
      if (error.response) {
        throw error;
      }
      
      // Otherwise, it's a network error (e.g. fetch failed entirely)
      // Emulate axios network error shape
      throw Object.assign(new Error(error.message || "Network Error"), {
        request: {}
      });
    }
  }

  protected parseResponse(response: FetchResponse): string {
    const output = this.config.responseParser(response);
    if (!output) {
      throw new AIHookError(
        "PROVIDER_ERROR",
        this.config.errorMessages.emptyResponse,
        this.config.name,
        "Check your model and API key"
      );
    }
    return output;
  }

  protected handleError(error: any): AIHookError {
    if (error.response) {
      return this.handleHttpError(error);
    } else if (error.request) {
      return new AIHookError(
        "NETWORK_ERROR",
        this.config.errorMessages.networkError,
        this.config.name,
        "Check your internet connection"
      );
    } else {
      return new AIHookError(
        "UNKNOWN_ERROR",
        error.message || this.config.errorMessages.unknownError,
        this.config.name
      );
    }
  }

  protected getCapitalizedProviderName(): string {
    const name = this.config.name;
    // Handle special cases
    if (name === "openai") return "OpenAI";
    if (name === "openrouter") return "OpenRouter";
    if (name === "xai") return "xAI";
    if (name === "claude") return "Claude";
    if (name === "gemini") return "Gemini";
    if (name === "groq") return "Groq";
    if (name === "deepseek") return "DeepSeek";
    if (name === "mistral") return "Mistral";
    if (name === "perplexity") return "Perplexity";
    
    // Default: capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  protected handleHttpError(error: any): AIHookError {
    const status = error.response.status;
    const text = error.response.data?.error
      ? JSON.stringify(error.response.data.error)
      : error.response.statusText || "Unknown error";

    const providerName = this.config.name;

    switch (status) {
      case 400:
        return new AIHookError(
          "BAD_REQUEST",
          `${this.getCapitalizedProviderName()} rejected the request: ${text}`,
          providerName,
          "Check your prompt and model"
        );
      case 401:
        return new AIHookError(
          "INVALID_API_KEY",
          `Invalid ${this.getCapitalizedProviderName()} API key: ${text}`,
          providerName,
          `Verify your ${this.config.envKey} environment variable`
        );
      case 403:
        return new AIHookError(
          "MODEL_NOT_ALLOWED",
          `Your API key cannot access this model: ${text}`,
          providerName,
          "Try a different model or check API key permissions"
        );
      case 429:
        return new AIHookError(
          "RATE_LIMIT",
          `Too many requests to ${this.getCapitalizedProviderName()}: ${text}`,
          providerName,
          "Throttle requests or upgrade your plan"
        );
      default:
        return new AIHookError(
          "PROVIDER_ERROR",
          `${this.getCapitalizedProviderName()} API error: ${text}`,
          providerName
        );
    }
  }
}
