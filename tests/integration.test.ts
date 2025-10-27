import { wrap } from "../src/wrap";
import { getProvider, getAvailableProviders } from "../src/providers";
import { TEST_INPUTS, MOCK_RESPONSE, TEST_TIMEOUT } from "./setup";

// Mock fetch responses
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.OPENAI_KEY;
    delete process.env.CLAUDE_KEY;
    delete process.env.GEMINI_KEY;
    delete process.env.DEEPSEEK_KEY;
    delete process.env.GROQ_KEY;
    delete process.env.OPENROUTER_KEY;
    delete process.env.XAI_KEY;
    delete process.env.PERPLEXITY_KEY;
    delete process.env.MISTRAL_KEY;
    delete process.env.DEFAULT_PROVIDER;
  });

  describe("Provider Fallback Chain", () => {
    test("should fallback through multiple providers on failure", async () => {
      process.env.OPENAI_KEY = "sk-invalid-key";
      process.env.CLAUDE_KEY = "sk-invalid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      // Mock OpenAI and Claude failures, Groq success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Invalid API key" } })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Invalid API key" } })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: MOCK_RESPONSE } }],
            usage: { total_tokens: 100 }
          })
        } as Response);
      
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.medium);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("groq");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, TEST_TIMEOUT);

    test("should prefer OpenRouter when available", async () => {
      process.env.OPENROUTER_KEY = "sk-or-valid-key";
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("openrouter");
    }, TEST_TIMEOUT);

    test("should use default provider when specified", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      process.env.DEFAULT_PROVIDER = "groq";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("groq");
    }, TEST_TIMEOUT);
  });

  describe("Multi-Provider Workflows", () => {
    test("should use different providers for different tasks", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.CLAUDE_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        provider: "claude",
        targetLanguage: "es"
      });
      const explain = wrap((text: string) => text, { 
        task: "explain", 
        provider: "groq" 
      });
      
      const [summary, translation, explanation] = await Promise.all([
        summarize(TEST_INPUTS.long),
        translate(TEST_INPUTS.medium),
        explain(TEST_INPUTS.code)
      ]);
      
      expect(summary.meta.provider).toBe("openai");
      expect(translation.meta.provider).toBe("claude");
      expect(explanation.meta.provider).toBe("groq");
    }, TEST_TIMEOUT);

    test("should handle pipeline with different providers", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.CLAUDE_KEY = "sk-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        provider: "claude",
        targetLanguage: "fr"
      });
      
      const summary = await summarize(TEST_INPUTS.long);
      const translation = await translate(summary.output);
      
      expect(summary.meta.provider).toBe("openai");
      expect(translation.meta.provider).toBe("claude");
      expect(translation.meta.task).toBe("translate");
    }, TEST_TIMEOUT);
  });

  describe("Provider Availability Detection", () => {
    test("should detect all available providers", () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.CLAUDE_KEY = "sk-valid-key";
      process.env.GEMINI_KEY = "AIza-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      process.env.OPENROUTER_KEY = "sk-or-valid-key";
      
      const providers = getAvailableProviders();
      
      expect(providers).toContain("openrouter");
      expect(providers).toContain("groq");
      expect(providers).toContain("openai");
      expect(providers).toContain("gemini");
      expect(providers).toContain("claude");
      expect(providers.length).toBe(5);
    });

    test("should handle partial provider availability", () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      const providers = getAvailableProviders();
      
      expect(providers).toContain("groq");
      expect(providers).toContain("openai");
      expect(providers.length).toBe(2);
    });

    test("should handle no provider availability", () => {
      const providers = getAvailableProviders();
      expect(providers).toEqual([]);
    });
  });

  describe("Concurrent Operations", () => {
    test("should handle multiple concurrent requests", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const promises = Array.from({ length: 5 }, (_, i) => 
        summarize(`Test input ${i + 1}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.output).toBe(MOCK_RESPONSE);
        expect(result.meta.provider).toBe("openai");
      });
    }, TEST_TIMEOUT);

    test("should handle mixed success and failure scenarios", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      // Mock mixed responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "Success 1" } }],
            usage: { total_tokens: 50 }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Invalid API key" } })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "Success 2" } }],
            usage: { total_tokens: 50 }
          })
        } as Response);
      
      const summarize1 = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      const summarize2 = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      const summarize3 = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "groq" 
      });
      
      const [result1, result2, result3] = await Promise.allSettled([
        summarize1(TEST_INPUTS.short),
        summarize2(TEST_INPUTS.medium),
        summarize3(TEST_INPUTS.long)
      ]);
      
      expect(result1.status).toBe("fulfilled");
      expect(result2.status).toBe("rejected");
      expect(result3.status).toBe("fulfilled");
    }, TEST_TIMEOUT);
  });

  describe("Model Selection", () => {
    test("should use default model when none specified", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      const result = await summarize(TEST_INPUTS.short);
      
      expect(result.meta.model).toBeDefined();
      expect(result.meta.provider).toBe("openai");
    }, TEST_TIMEOUT);

    test("should use specified model when provided", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai",
        model: "gpt-4"
      });
      
      const result = await summarize(TEST_INPUTS.short);
      
      expect(result.meta.model).toBe("gpt-4");
      expect(result.meta.provider).toBe("openai");
    }, TEST_TIMEOUT);
  });

  describe("Caching Integration", () => {
    test("should handle caching across different providers", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: MOCK_RESPONSE } }],
          usage: { total_tokens: 100 }
        })
      } as Response);
      
      const summarize1 = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai"
      });
      const summarize2 = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "groq"
      });
      
      const [result1, result2] = await Promise.all([
        summarize1(TEST_INPUTS.short),
        summarize2(TEST_INPUTS.short)
      ]);
      
      expect(result1.output).toBe(MOCK_RESPONSE);
      expect(result2.output).toBe(MOCK_RESPONSE);
      expect(result1.meta.provider).toBe("openai");
      expect(result2.meta.provider).toBe("groq");
    }, TEST_TIMEOUT);
  });

  describe("Error Recovery", () => {
    test("should recover from temporary failures", async () => {
      process.env.OPENAI_KEY = "sk-valid-key";
      
      // Mock temporary failure followed by success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: { message: "Service temporarily unavailable" } })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: MOCK_RESPONSE } }],
            usage: { total_tokens: 100 }
          })
        } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      // First call should fail
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
      
      // Second call should succeed
      const result = await summarize(TEST_INPUTS.short);
      expect(result.output).toBe(MOCK_RESPONSE);
    }, TEST_TIMEOUT);
  });
});
