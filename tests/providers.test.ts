import { wrap } from "../src/wrap";
import { initAIHooks, getProvider, getAvailableProviders, reset, addProvider, removeProvider } from "../src/providers";
import { TEST_INPUTS, MOCK_RESPONSE, TEST_TIMEOUT, initializeProvidersFromEnv, hasProvidersAvailable } from "./setup";
import { BaseProvider } from "../src/providers/base/BaseProvider";

// Mock fetch responses for other scenarios
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;


describe("Provider Tests (New Initialization System)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the provider system
    reset();
  });

  // Test with environment variables if available
  if (hasProvidersAvailable()) {
    describe("Environment-based Provider Tests", () => {
      beforeEach(() => {
        jest.clearAllMocks();
        initializeProvidersFromEnv();
      });

      test("should initialize providers from environment variables", () => {
        const providers = getAvailableProviders();
        expect(providers.length).toBeGreaterThan(0);
        console.log(`Available providers from env: ${providers.join(', ')}`);
      });

      test("should work with real API keys (if available)", async () => {
        const summarize = wrap((text: string) => text, { task: "summarize" });
        
        try {
          const result = await summarize("This is a test for real API integration.");
          expect(typeof result).toBe("object");
          expect(result.output).toBeDefined();
          expect(typeof result.output).toBe("string");
          expect(result.output.length).toBeGreaterThan(0);
          console.log("Real API test successful:", result.output.substring(0, 100) + "...");
        } catch (error) {
          // If API keys are invalid, that's expected in test environment
          console.log("API test failed (expected with test keys):", error instanceof Error ? error.message : String(error));
          expect(error instanceof Error ? error.message : String(error)).toContain("Invalid");
        }
      }, TEST_TIMEOUT);
    });
  } else {
    describe("Environment-based Provider Tests", () => {
      test("should skip real API tests when no environment variables are set", () => {
        console.log("Skipping real API tests - no environment variables found");
        expect(true).toBe(true);
      });
    });
  }

  describe("Provider Detection", () => {
    test("should detect no providers when not initialized", () => {
      const providers = getAvailableProviders();
      expect(providers).toEqual([]);
    });

    test("should detect available providers when initialized", () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' },
          { provider: 'claude', key: 'sk-test-key' }
        ]
      });
      
      const providers = getAvailableProviders();
      expect(providers).toContain("openai");
      expect(providers).toContain("claude");
    });

    test("should prefer OpenRouter when available", () => {
      initAIHooks({
        providers: [
          { provider: 'openrouter', key: 'sk-or-test-key' },
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });
      
      const providers = getAvailableProviders();
      expect(providers[0]).toBe("openrouter");
    });
  });

  describe("Provider Selection", () => {
    test("should throw error when no providers are available", () => {
      // After reset(), both new and legacy system have no providers
      expect(() => getProvider()).toThrow();
    });

    test("should select specified provider when available", () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' },
          { provider: 'claude', key: 'sk-test-key' }
        ]
      });

      const { provider } = getProvider('claude');
      expect(provider).toBe('claude');
    });

    test("should fallback to first available provider", () => {
      initAIHooks({
        providers: [
          { provider: 'groq', key: 'gsk-test-key' },
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      const { provider } = getProvider();
      expect(provider).toBe('groq');
    });

    test("should throw error when specified provider is not available", () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      // Requesting 'claude' when only 'openai' is initialized should throw
      expect(() => getProvider('claude')).toThrow();
    });
  });

  describe("Provider API Calls", () => {
    beforeEach(() => {
      // Mock successful API responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }]
        })
      } as Response);
    });

    test("should work with OpenAI provider", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });

      // Expect the API to successfully parse the mocked response
      const result = await summarize(TEST_INPUTS.medium);
      expect(result.output).toBe(MOCK_RESPONSE);
    }, TEST_TIMEOUT);

    test("should work with Claude provider", async () => {
      initAIHooks({
        providers: [
          { provider: 'claude', key: 'sk-test-key' }
        ]
      });

      const explain = wrap((text: string) => text, { 
        task: "explain", 
        provider: "claude" 
      });

      // Mock Claude response shape
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: MOCK_RESPONSE }]
        })
      } as Response);

      // Expect the API to successfully parse the mocked response
      const result = await explain(TEST_INPUTS.code);
      expect(result.output).toBe(MOCK_RESPONSE);
    }, TEST_TIMEOUT);

    test("should work with Groq provider", async () => {
      initAIHooks({
        providers: [
          { provider: 'groq', key: 'gsk-test-key' }
        ]
      });

      const rewrite = wrap((text: string) => text, { 
        task: "rewrite", 
        provider: "groq" 
      });

      // Expect the API to successfully parse the mocked response
      const result = await rewrite(TEST_INPUTS.medium);
      expect(result.output).toBe(MOCK_RESPONSE);
    }, TEST_TIMEOUT);
  });

  describe("Provider Error Handling", () => {
    test("should handle API key errors", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-invalid-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // Mock 401 response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: "Incorrect API key provided" }
        })
      } as Response);

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow("Invalid OpenAI API key");
    }, TEST_TIMEOUT);

    test("should handle rate limit errors", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // Mock 429 via BaseProvider.makeRequest spy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy.mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
        response: { status: 429, data: { error: { message: "Rate limit exceeded" } }, statusText: "Too Many Requests" }
      }));

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow("Too many requests to OpenAI");
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);

    test("should handle model not found errors", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { 
        task: "summarize",
        provider: "openai",
        model: "gpt-4"
      });

      // Mock 400 via BaseProvider.makeRequest spy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy.mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
        response: { status: 400, data: { error: { message: "Model not found" } }, statusText: "Bad Request" }
      }));

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow("OpenAI rejected the request");
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);

    test("should handle network errors", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // Mock network error via BaseProvider.makeRequest spy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy.mockRejectedValueOnce(Object.assign(new Error("Network error"), {
        request: {} // has request but no response = network error path
      }));

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow("Network error while contacting OpenAI");
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);
  });

  describe("Provider Fallback", () => {
    test("should automatically fallback to next provider when first fails", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-invalid-key' },
          { provider: 'groq', key: 'gsk-invalid-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // Spy on makeRequest to simulate both providers failing with 401
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy
        .mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
          response: { status: 401, data: { error: { message: "Incorrect API key" } }, statusText: "Unauthorized" }
        }))
        .mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
          response: { status: 401, data: { error: { message: "Incorrect API key" } }, statusText: "Unauthorized" }
        }));

      // Both fail → should throw Groq's error (last provider tried)
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow("Invalid Groq API key");
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);

    test("should succeed on second provider when first fails", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-invalid-key' },
          { provider: 'groq', key: 'gsk-valid-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // First call (OpenAI) → 401, second call (Groq) → success
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy
        .mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
          response: { status: 401, data: { error: { message: "Incorrect API key" } }, statusText: "Unauthorized" }
        }))
        .mockResolvedValueOnce({
          data: { choices: [{ message: { content: MOCK_RESPONSE } }] }
        });

      const result = await summarize(TEST_INPUTS.short);
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("groq");
      expect(result.meta.fallback).toBe(true);
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);

    test("should succeed on third provider when first two fail", async () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-invalid-key' },
          { provider: 'gemini', key: 'gemini-invalid-key' },
          { provider: 'groq', key: 'gsk-valid-key' }
        ]
      });

      const summarize = wrap((text: string) => text, { task: "summarize" });

      // OpenAI 401 → Gemini 401 → Groq succeeds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, 'makeRequest');
      makeRequestSpy
        .mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
          response: { status: 401, data: { error: { message: "Incorrect API key" } }, statusText: "Unauthorized" }
        }))
        .mockRejectedValueOnce(Object.assign(new Error("Request failed"), {
          response: { status: 401, data: { error: { message: "Incorrect API key" } }, statusText: "Unauthorized" }
        }))
        .mockResolvedValueOnce({
          data: { choices: [{ message: { content: MOCK_RESPONSE } }] }
        });

      const result = await summarize(TEST_INPUTS.short);
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("groq");
      expect(result.meta.fallback).toBe(true);
      makeRequestSpy.mockRestore();
    }, TEST_TIMEOUT);
  });


  describe("Dynamic Provider Management", () => {
    test("should add providers dynamically", () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' }
        ]
      });

      addProvider({ provider: 'claude', key: 'sk-test-key' });

      const providers = getAvailableProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('claude');
    });

    test("should remove providers dynamically", () => {
      initAIHooks({
        providers: [
          { provider: 'openai', key: 'sk-test-key' },
          { provider: 'claude', key: 'sk-test-key' }
        ]
      });

      removeProvider('claude');

      const providers = getAvailableProviders();
      expect(providers).toContain('openai');
      expect(providers).not.toContain('claude');
    });
  });
});
