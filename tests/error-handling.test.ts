import { wrap } from "../src/wrap";
import { getProvider, initAIHooks, reset } from "../src/providers";
import { BaseProvider } from "../src/providers/base/BaseProvider";
import { AIHookError } from "../src/errors";
import { TEST_INPUTS, TEST_TIMEOUT } from "./setup";

describe("Error Handling Tests", () => {
  let makeRequestSpy: jest.SpyInstance;

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

    // Reset the new provider system
    reset();

    // Default spy that resolves successfully — individual tests can override
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, "makeRequest").mockResolvedValue({
      data: { choices: [{ message: { content: "Processed input" } }] }
    });
  });

  afterEach(() => {
    makeRequestSpy?.mockRestore();
  });

  describe("No Provider Available", () => {
    test("should throw error when no API keys are set", () => {
      // After reset() and no initAIHooks call, no provider is available
      expect(() => getProvider()).toThrow(AIHookError);
      expect(() => getProvider()).toThrow("No valid AI provider API key was found");
    });

    test("should throw error when all API keys are invalid", async () => {
      initAIHooks({
        providers: [
          { provider: "openai", key: "invalid-key" },
          { provider: "claude", key: "invalid-key" }
        ]
      });

      // Both providers will reject with 401
      makeRequestSpy
        .mockRejectedValueOnce(
          Object.assign(new Error("Request failed"), {
            response: {
              status: 401,
              data: { error: { message: "Invalid API key" } },
              statusText: "Unauthorized"
            }
          })
        )
        .mockRejectedValueOnce(
          Object.assign(new Error("Request failed"), {
            response: {
              status: 401,
              data: { error: { message: "Invalid API key" } },
              statusText: "Unauthorized"
            }
          })
        );

      const summarize = wrap((text: string) => text, { task: "summarize" });

      return expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("API Key Errors", () => {
    test("should handle invalid OpenAI API key", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-invalid-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 401,
            data: { error: { message: "Incorrect API key provided", type: "invalid_request_error" } },
            statusText: "Unauthorized"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle invalid Claude API key", async () => {
      initAIHooks({ providers: [{ provider: "claude", key: "sk-invalid-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 401,
            data: { error: { message: "Invalid API key", type: "authentication_error" } },
            statusText: "Unauthorized"
          }
        })
      );

      const explain = wrap((text: string) => text, {
        task: "explain",
        provider: "claude"
      });

      await expect(explain(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle invalid Gemini API key", async () => {
      initAIHooks({ providers: [{ provider: "gemini", key: "AIza-invalid-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 400,
            data: { error: { message: "API key not valid", status: "INVALID_ARGUMENT" } },
            statusText: "Bad Request"
          }
        })
      );

      const translate = wrap((text: string) => text, {
        task: "translate",
        provider: "gemini"
      });

      await expect(translate(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Rate Limiting", () => {
    test("should handle rate limit exceeded", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 429,
            data: { error: { message: "Rate limit exceeded", type: "rate_limit_error" } },
            statusText: "Too Many Requests"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle quota exceeded", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 429,
            data: { error: { message: "You exceeded your current quota", type: "insufficient_quota" } },
            statusText: "Too Many Requests"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Model Errors", () => {
    test("should handle model not found", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 404,
            data: {
              error: {
                message: "The model 'gpt-nonexistent' does not exist",
                type: "invalid_request_error"
              }
            },
            statusText: "Not Found"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai",
        model: "gpt-3.5-turbo"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle model not allowed", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 403,
            data: {
              error: {
                message: "Your API key does not have access to gpt-4",
                type: "permission_denied"
              }
            },
            statusText: "Forbidden"
          }
        })
      );

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
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      // Using `request` property (not `response`) triggers the network error path in handleError
      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request timeout"), { request: {} })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle connection refused", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Connection refused"), { request: {} })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle DNS resolution failure", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("getaddrinfo ENOTFOUND"), { request: {} })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Server Errors", () => {
    test("should handle 500 internal server error", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 500,
            data: { error: { message: "Internal server error", type: "server_error" } },
            statusText: "Internal Server Error"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle 502 bad gateway", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 502,
            data: { error: { message: "Bad gateway", type: "server_error" } },
            statusText: "Bad Gateway"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle 503 service unavailable", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 503,
            data: { error: { message: "Service temporarily unavailable", type: "server_error" } },
            statusText: "Service Unavailable"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Malformed Responses", () => {
    test("should handle malformed JSON response", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      // Resolve with data that has no parseable choices → responseParser throws
      makeRequestSpy.mockResolvedValueOnce({ data: {} });

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle empty response", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockResolvedValueOnce({ data: {} });

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle response without choices", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockResolvedValueOnce({ data: { choices: [] } });

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });

  describe("Input Validation", () => {
    test("should handle null input", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockResolvedValueOnce({
        data: { choices: [{ message: { content: "Processed null input" } }] }
      });

      const summarize = wrap((text: unknown) => text, { task: "summarize" });

      const result = await summarize(null);
      expect(result.output).toBe("Processed null input");
    }, TEST_TIMEOUT);

    test("should handle undefined input", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockResolvedValueOnce({
        data: { choices: [{ message: { content: "Processed undefined input" } }] }
      });

      const summarize = wrap((text: unknown) => text, { task: "summarize" });

      const result = await summarize(undefined);
      expect(result.output).toBe("Processed undefined input");
    }, TEST_TIMEOUT);

    test("should handle non-string input", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockResolvedValueOnce({
        data: { choices: [{ message: { content: "Processed number input" } }] }
      });

      const summarize = wrap((text: unknown) => text, { task: "summarize" });

      const result = await summarize(123);
      expect(result.output).toBe("Processed number input");
    }, TEST_TIMEOUT);
  });

  describe("Provider-Specific Errors", () => {
    test("should handle OpenAI specific errors", async () => {
      initAIHooks({ providers: [{ provider: "openai", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 400,
            data: {
              error: {
                message: "This model's maximum context length is 4097 tokens",
                type: "invalid_request_error",
                code: "context_length_exceeded"
              }
            },
            statusText: "Bad Request"
          }
        })
      );

      const summarize = wrap((text: string) => text, {
        task: "summarize",
        provider: "openai"
      });

      await expect(summarize(TEST_INPUTS.long)).rejects.toThrow();
    }, TEST_TIMEOUT);

    test("should handle Claude specific errors", async () => {
      initAIHooks({ providers: [{ provider: "claude", key: "sk-test-key" }] });

      makeRequestSpy.mockRejectedValueOnce(
        Object.assign(new Error("Request failed"), {
          response: {
            status: 400,
            data: {
              error: {
                message: "Request too large",
                type: "invalid_request_error"
              }
            },
            statusText: "Bad Request"
          }
        })
      );

      const explain = wrap((text: string) => text, {
        task: "explain",
        provider: "claude"
      });

      await expect(explain(TEST_INPUTS.long)).rejects.toThrow();
    }, TEST_TIMEOUT);
  });
});
