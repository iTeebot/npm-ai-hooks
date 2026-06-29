import { ProviderManager, UserProviderConfig, ProviderInitializationOptions } from "./base/ProviderConfig";
import { Provider } from "../types";

// Global provider manager instance
let providerManager: ProviderManager | null = null;

/**
 * Initialize the AI hooks system with provider configurations
 * @param options - Provider initialization options
 * @example
 * ```typescript
 * import { initAIHooks } from 'npm-ai-hooks';
 * 
 * initAIHooks({
 *   providers: [
 *     { provider: 'openai', key: 'sk-...', defaultModel: 'gpt-4' },
 *     { provider: 'claude', key: 'sk-ant-...', defaultModel: 'claude-3-sonnet-20240229' },
 *     { provider: 'groq', key: 'gsk_...', defaultModel: 'llama-3.1-70b-versatile' }
 *   ],
 *   defaultProvider: 'openai' // optional
 * });
 * ```
 */
export function initAIHooks(options: ProviderInitializationOptions): void {
  providerManager = new ProviderManager(options);
}

/**
 * Add a new provider after initialization
 * @param config - Provider configuration
 * @example
 * ```typescript
 * addProvider({ provider: 'mistral', key: '...', defaultModel: 'mistral-large' });
 * ```
 */
export function addProvider(config: UserProviderConfig): void {
  if (!providerManager) {
    throw new Error('AI hooks not initialized. Call initAIHooks() first.');
  }
  providerManager.addProvider(config);
}

/**
 * Remove a provider
 * @param provider - Provider to remove
 */
export function removeProvider(provider: Provider): void {
  if (!providerManager) {
    throw new Error('AI hooks not initialized. Call initAIHooks() first.');
  }
  providerManager.removeProvider(provider);
}

/**
 * Get available providers
 * @returns Array of available provider names
 */
export function getAvailableProviders(): Provider[] {
  if (!providerManager) {
    throw new Error('AI hooks not initialized. Call initAIHooks() first.');
  }
  return providerManager.getAvailableProviders();
}

/**
 * Get a provider function
 * @param name - Optional provider name
 * @returns Provider function and name
 */
export function getProvider(name?: Provider): { fn: (prompt: string, model?: string) => Promise<string>; provider: Provider } {
  if (!providerManager) {
    throw new Error('AI hooks not initialized. Call initAIHooks() first.');
  }
  return providerManager.getProvider(name);
}

/**
 * Get the full ordered provider chain for fallback
 * @param name - Optional preferred provider name (placed first)
 * @returns Ordered array of {fn, provider} to try in sequence
 */
export function getProviderChain(name?: Provider): Array<{ fn: (prompt: string, model?: string) => Promise<string>; provider: Provider }> {
  if (!providerManager) {
    throw new Error('AI hooks not initialized. Call initAIHooks() first.');
  }
  return providerManager.getProviderChain(name);
}

/**
 * Check if AI hooks is initialized
 * @returns True if initialized
 */
export function isInitialized(): boolean {
  return providerManager !== null;
}

/**
 * Reset the provider manager (useful for testing)
 */
export function reset(): void {
  providerManager = null;
}

// Export types for users
export type { UserProviderConfig, ProviderInitializationOptions };
