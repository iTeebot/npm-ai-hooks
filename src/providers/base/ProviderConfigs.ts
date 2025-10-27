import { ProviderConfig } from "./BaseProvider";

// Common response parsers
export const responseParsers = {
  openaiStyle: (response: any) => response.data?.choices?.[0]?.message?.content,
  claudeStyle: (response: any) => response.data?.content?.[0]?.text,
  geminiStyle: (response: any) => response.data?.candidates?.[0]?.content?.parts?.[0]?.text,
};

// Common request body builders
export const requestBodyBuilders = {
  openaiStyle: (prompt: string, model: string) => ({
    model,
    messages: [{ role: "user", content: prompt }]
  }),
  claudeStyle: (prompt: string, model: string) => ({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  }),
  geminiStyle: (prompt: string, model: string) => ({
    contents: [{
      parts: [{ text: prompt }]
    }]
  }),
};

// Provider configurations
export const providerConfigs: Record<string, ProviderConfig> = {
  openai: {
    name: "openai",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    envKey: "OPENAI_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing OpenAI API key.",
      emptyResponse: "OpenAI returned empty response",
      badRequest: "OpenAI rejected the request",
      invalidKey: "Invalid OpenAI API key",
      rateLimit: "Too many requests to OpenAI",
      networkError: "Network error while contacting OpenAI",
      unknownError: "Unknown error occurred"
    }
  },

  groq: {
    name: "groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    envKey: "GROQ_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing Groq API key.",
      emptyResponse: "Groq returned empty response",
      badRequest: "Groq rejected the request",
      invalidKey: "Invalid Groq API key",
      rateLimit: "Too many requests to Groq",
      networkError: "Network error while contacting Groq",
      unknownError: "Unknown error occurred"
    }
  },

  claude: {
    name: "claude",
    baseUrl: "https://api.anthropic.com/v1/messages",
    envKey: "CLAUDE_KEY",
    headers: { 
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01"
    },
    requestBody: requestBodyBuilders.claudeStyle,
    responseParser: responseParsers.claudeStyle,
    errorMessages: {
      missingKey: "Missing Claude API key.",
      emptyResponse: "Claude returned empty response",
      badRequest: "Claude rejected the request",
      invalidKey: "Invalid Claude API key",
      rateLimit: "Too many requests to Claude",
      networkError: "Network error while contacting Claude",
      unknownError: "Unknown error occurred"
    }
  },

  gemini: {
    name: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    envKey: "GEMINI_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.geminiStyle,
    responseParser: responseParsers.geminiStyle,
    errorMessages: {
      missingKey: "Missing Gemini API key.",
      emptyResponse: "Gemini returned empty response",
      badRequest: "Gemini rejected the request",
      invalidKey: "Invalid Gemini API key",
      rateLimit: "Too many requests to Gemini",
      networkError: "Network error while contacting Gemini",
      unknownError: "Unknown error occurred"
    }
  },

  deepseek: {
    name: "deepseek",
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    envKey: "DEEPSEEK_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing DeepSeek API key.",
      emptyResponse: "DeepSeek returned empty response",
      badRequest: "DeepSeek rejected the request",
      invalidKey: "Invalid DeepSeek API key",
      rateLimit: "Too many requests to DeepSeek",
      networkError: "Network error while contacting DeepSeek",
      unknownError: "Unknown error occurred"
    }
  },

  mistral: {
    name: "mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    envKey: "MISTRAL_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing Mistral API key.",
      emptyResponse: "Mistral returned empty response",
      badRequest: "Mistral rejected the request",
      invalidKey: "Invalid Mistral API key",
      rateLimit: "Too many requests to Mistral",
      networkError: "Network error while contacting Mistral",
      unknownError: "Unknown error occurred"
    }
  },

  xai: {
    name: "xai",
    baseUrl: "https://api.x.ai/v1/chat/completions",
    envKey: "XAI_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing xAI API key.",
      emptyResponse: "xAI returned empty response",
      badRequest: "xAI rejected the request",
      invalidKey: "Invalid xAI API key",
      rateLimit: "Too many requests to xAI",
      networkError: "Network error while contacting xAI",
      unknownError: "Unknown error occurred"
    }
  },

  perplexity: {
    name: "perplexity",
    baseUrl: "https://api.perplexity.ai/chat/completions",
    envKey: "PERPLEXITY_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing Perplexity API key.",
      emptyResponse: "Perplexity returned empty response",
      badRequest: "Perplexity rejected the request",
      invalidKey: "Invalid Perplexity API key",
      rateLimit: "Too many requests to Perplexity",
      networkError: "Network error while contacting Perplexity",
      unknownError: "Unknown error occurred"
    }
  },

  openrouter: {
    name: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    envKey: "OPENROUTER_KEY",
    headers: { "Content-Type": "application/json" },
    requestBody: requestBodyBuilders.openaiStyle,
    responseParser: responseParsers.openaiStyle,
    errorMessages: {
      missingKey: "Missing OpenRouter API key.",
      emptyResponse: "OpenRouter returned empty response",
      badRequest: "OpenRouter rejected the request",
      invalidKey: "Invalid OpenRouter API key",
      rateLimit: "Too many requests to OpenRouter",
      networkError: "Network error while contacting OpenRouter",
      unknownError: "Unknown error occurred"
    }
  }
};
