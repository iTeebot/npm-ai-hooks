import { wrap } from "../src/wrap";
import { getProvider } from "../src/providers";
import { AIHookError } from "../src/errors";
import { TEST_INPUTS, TEST_TIMEOUT } from "./setup";

// Mock fetch responses
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Error Handling Tests", () => {
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
  });

  describe("No Provider Available", () => {
    test("should throw error when no API keys are set", () => {
      expect(() => getProvider()).toThrow(AIHookError);
      expect(() => getProvider()).toThrow("No valid AI provider API key was found");
    });

    test("should throw error when all API keys are invalid", () => {
      process.env.OPENAI_KEY = "invalid-key";
      process.env.CLAUDE_KEY = "invalid-key";
      
      // Mock API error responses
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } })
      } as Response);
      
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      return expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("API Key Errors", () => {
    test("should handle invalid OpenAI API key", async () => {
      process.env.OPENAI_KEY = "sk-invalid-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: "Incorrect API key provided",
            type: "invalid_request_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle invalid Claude API key", async () => {
      process.env.CLAUDE_KEY = "sk-invalid-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: "Invalid API key",
            type: "authentication_error"
          }
        })
      } as Response);
      
      const explain = wrap((text: string) => text, { 
        task: "explain", 
        provider: "claude" 
      });
      
      await expect(explain(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle invalid Gemini API key", async () => {
      process.env.GEMINI_KEY = "AIza-invalid-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: "API key not valid",
            status: "INVALID_ARGUMENT"
          }
        })
      } as Response);
      
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        provider: "gemini" 
      });
      
      await expect(translate(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Rate Limiting", () => {
    test("should handle rate limit exceeded", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({
          "retry-after": "60"
        }),
        json: async () => ({
          error: {
            message: "Rate limit exceeded",
            type: "rate_limit_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle quota exceeded", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: "You exceeded your current quota",
            type: "insufficient_quota"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Model Errors", () => {
    test("should handle model not found", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            message: "The model 'gpt-nonexistent' does not exist",
            type: "invalid_request_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai",
        model: "gpt-3.5-turbo"
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle model not allowed", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            message: "Your API key does not have access to gpt-4",
            type: "permission_denied"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai",
        model: "gpt-4"
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Network Errors", () => {
    test("should handle network timeout", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockRejectedValue(new Error("Request timeout"));
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle connection refused", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockRejectedValue(new Error("Connection refused"));
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle DNS resolution failure", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Server Errors", () => {
    test("should handle 500 internal server error", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            message: "Internal server error",
            type: "server_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle 502 bad gateway", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({
          error: {
            message: "Bad gateway",
            type: "server_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle 503 service unavailable", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          error: {
            message: "Service temporarily unavailable",
            type: "server_error"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Malformed Responses", () => {
    test("should handle malformed JSON response", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        type: "basic",
        url: "https://api.openai.com/v1/chat/completions",
        redirected: false,
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob([]),
        formData: async () => new FormData(),
        bytes: async () => new Uint8Array(0),
        json: async () => {
          throw new Error("Unexpected token in JSON");
        },
        text: async () => "Invalid JSON response"
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle empty response", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
        text: async () => ""
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle response without choices", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          usage: { total_tokens: 100 }
        }),
        text: async () => "No choices in response"
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Input Validation", () => {
    test("should handle null input", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Processed null input" } }],
          usage: { total_tokens: 10 }
        })
      } as Response);
      
      const summarize = wrap((text: any) => text, { task: "summarize" });
      
      const result = await summarize(null);
      expect(result.output).toBe("Processed null input");
    }, TEST_TIMEOUT);

    test("should handle undefined input", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Processed undefined input" } }],
          usage: { total_tokens: 10 }
        })
      } as Response);
      
      const summarize = wrap((text: any) => text, { task: "summarize" });
      
      const result = await summarize(undefined);
      expect(result.output).toBe("Processed undefined input");
    }, TEST_TIMEOUT);

    test("should handle non-string input", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Processed number input" } }],
          usage: { total_tokens: 10 }
        })
      } as Response);
      
      const summarize = wrap((text: any) => text, { task: "summarize" });
      
      const result = await summarize(123);
      expect(result.output).toBe("Processed number input");
    }, TEST_TIMEOUT);
  });

  describe("Provider-Specific Errors", () => {
    test("should handle OpenAI specific errors", async () => {
      process.env.OPENAI_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: "This model's maximum context length is 4097 tokens",
            type: "invalid_request_error",
            code: "context_length_exceeded"
          }
        })
      } as Response);
      
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      await expect(summarize(TEST_INPUTS.long)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle Claude specific errors", async () => {
      process.env.CLAUDE_KEY = "sk-test-key";
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: "Request too large",
            type: "invalid_request_error"
          }
        })
      } as Response);
      
      const explain = wrap((text: string) => text, { 
        task: "explain", 
        provider: "claude" 
      });
      
      await expect(explain(TEST_INPUTS.long)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });
});
