import { BaseProvider } from "./BaseProvider";
import { Provider } from "../../types";
import { ProviderFunction } from "../../types/core/providers";

export class ProviderRegistry {
  private providers = new Map<Provider, BaseProvider>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private providerFunctions = new Map<Provider, ProviderFunction<any>>();

  register<T extends Provider>(name: T, provider: BaseProvider): void {
    this.providers.set(name, provider);
    this.providerFunctions.set(name, this.createProviderFunction(provider));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(name: Provider): ProviderFunction<any> | undefined {
    return this.providerFunctions.get(name);
  }

  getAvailableProviders(): Provider[] {
    const available: Provider[] = [];
    
    // Always prefer openrouter if present (matching original behavior)
    if (this.providers.has("openrouter")) {
      const openrouterProvider = this.providers.get("openrouter")!;
      const apiKey = openrouterProvider['getApiKey']();
      if (apiKey) {
        available.push("openrouter");
      }
    }
    
    // Add others in order of their presence (matching original behavior)
    const otherProviders: Provider[] = ['groq', 'openai', 'gemini', 'claude', 'deepseek', 'xai', 'perplexity', 'mistral'];
    
    for (const providerName of otherProviders) {
      if (this.providers.has(providerName)) {
        const provider = this.providers.get(providerName)!;
        const apiKey = provider['getApiKey']();
        if (apiKey && !available.includes(providerName)) {
          available.push(providerName);
        }
      }
    }
    
    return available;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createProviderFunction(provider: BaseProvider): ProviderFunction<any> {
    return async (prompt: string, model: string) => {
      return provider.call(prompt, model);
    };
  }
}

// Global registry instance
export const providerRegistry = new ProviderRegistry();
