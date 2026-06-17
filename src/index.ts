// src/index.ts
export { wrap } from "./wrap";
export type { MultimodalInput } from "./wrap";
export { 
  initAIHooks, 
  addProvider, 
  removeProvider, 
  getAvailableProviders, 
  getProvider, 
  getProviderChain,
  isInitialized, 
  reset 
} from "./providers";

// Export types
export type { 
  Provider, 
  ProviderModels,
  TaskType 
} from "./types";

// Export model types
export type {
  OpenAIModel,
  ClaudeModel,
  GeminiModel,
  GroqModel,
  DeepSeekModel,
  XAIModel,
  MistralModel,
  PerplexityModel,
  OpenRouterModel
} from "./types";

// Export provider utilities
export {
  PROVIDER_NAMES,
  getProviderModels,
  getAllProviders,
  getProviderInfo,
  getAllProviderInfo,
  type ProviderInfo
} from "./utils/providerInfo";

// Export key validation utilities
export {
  validateApiKey,
  validateApiKeys,
  quickValidateKeyFormat,
  type KeyValidationResult
} from "./utils/keyValidator";