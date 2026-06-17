import { wrap } from "../src/wrap";
import { getAvailableProviders, initAIHooks, reset } from "../src/providers";
import { BaseProvider } from "../src/providers/base/BaseProvider";
import { TEST_INPUTS, MOCK_RESPONSE, TEST_TIMEOUT } from "./setup";

// ─── Shared mock payloads ────────────────────────────────────────────────────

const SUCCESS_RESPONSE = {
  data: { choices: [{ message: { content: MOCK_RESPONSE } }] }
};

const SUCCESS_RESPONSE_CLAUDE = {
  data: { content: [{ text: MOCK_RESPONSE }] }
};

const error401 = () =>
  Object.assign(new Error("Request failed"), {
    response: {
      status: 401,
      data: { error: { message: "Invalid API key" } },
      statusText: "Unauthorized"
    }
  });

const error503 = () =>
  Object.assign(new Error("Request failed"), {
    response: {
      status: 503,
      data: { error: { message: "Service unavailable" } },
      statusText: "Service Unavailable"
    }
  });

// ─── Test suite ──────────────────────────────────────────────────────────────

describe("Integration Tests", () => {
  let makeRequestSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    reset();
    makeRequestSpy = jest.spyOn(BaseProvider.prototype as any, "makeRequest");
  });

  afterEach(() => {
    makeRequestSpy?.mockRestore();
    reset();
  });

  // ── Provider Fallback Chain ─────────────────────────────────────────────────

  describe("Provider Fallback Chain", () => {
    test(
      "should fallback through multiple providers on failure",
      async () => {
        // openai (fails) → claude (fails) → groq (succeeds)
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-invalid-key" },
            { provider: "claude", key: "sk-invalid-key" },
            { provider: "groq",   key: "gr-valid-key" }
          ]
        });

        makeRequestSpy
          .mockRejectedValueOnce(error401())  // openai fails
          .mockRejectedValueOnce(error401())  // claude fails
          .mockResolvedValueOnce(SUCCESS_RESPONSE); // groq succeeds

        const summarize = wrap((text: string) => text, { task: "summarize" });

        const result = await summarize(TEST_INPUTS.medium);

        expect(result.output).toBe(MOCK_RESPONSE);
        expect(result.meta.provider).toBe("groq");
        expect(makeRequestSpy).toHaveBeenCalledTimes(3);
      },
      TEST_TIMEOUT
    );

    test(
      "should prefer OpenRouter when available",
      async () => {
        // openrouter, openai, groq — openrouter goes first via chain ordering
        initAIHooks({
          providers: [
            { provider: "openrouter", key: "sk-or-valid-key" },
            { provider: "openai",     key: "sk-valid-key" },
            { provider: "groq",       key: "gr-valid-key" }
          ]
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

        const summarize = wrap((text: string) => text, { task: "summarize" });

        const result = await summarize(TEST_INPUTS.short);

        expect(result.output).toBe(MOCK_RESPONSE);
        expect(result.meta.provider).toBe("openrouter");
      },
      TEST_TIMEOUT
    );

    test(
      "should use default provider when specified",
      async () => {
        // defaultProvider: 'groq' means groq is placed first in chain
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-valid-key" },
            { provider: "groq",   key: "gr-valid-key" }
          ],
          defaultProvider: "groq"
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

        const summarize = wrap((text: string) => text, { task: "summarize" });

        const result = await summarize(TEST_INPUTS.short);

        expect(result.output).toBe(MOCK_RESPONSE);
        expect(result.meta.provider).toBe("groq");
      },
      TEST_TIMEOUT
    );
  });

  // ── Multi-Provider Workflows ────────────────────────────────────────────────

  describe("Multi-Provider Workflows", () => {
    test(
      "should use different providers for different tasks",
      async () => {
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-valid-key" },
            { provider: "claude", key: "sk-valid-key" },
            { provider: "groq",   key: "gr-valid-key" }
          ]
        });

        // Each wrapped fn pins a specific provider — return appropriate shape
        makeRequestSpy.mockImplementation((_config: any) =>
          Promise.resolve(SUCCESS_RESPONSE)
        );

        const summarize = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai"
        });
        const translate = wrap((text: string) => text, {
          task: "translate",
          provider: "claude",
          targetLanguage: "es"
        } as any);
        const explain = wrap((text: string) => text, {
          task: "explain",
          provider: "groq"
        });

        // Claude uses a different response shape — patch just for claude calls
        let callIndex = 0;
        makeRequestSpy.mockImplementation((_config: any) => {
          callIndex++;
          // translate is the 2nd call (claude) — return claude-style response
          if (callIndex === 2) {
            return Promise.resolve(SUCCESS_RESPONSE_CLAUDE);
          }
          return Promise.resolve(SUCCESS_RESPONSE);
        });

        const [summary, translation, explanation] = await Promise.all([
          summarize(TEST_INPUTS.long),
          translate(TEST_INPUTS.medium),
          explain(TEST_INPUTS.code)
        ]);

        expect(summary.meta.provider).toBe("openai");
        expect(translation.meta.provider).toBe("claude");
        expect(explanation.meta.provider).toBe("groq");
      },
      TEST_TIMEOUT
    );

    test(
      "should handle pipeline with different providers",
      async () => {
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-valid-key" },
            { provider: "claude", key: "sk-valid-key" }
          ]
        });

        let callIndex = 0;
        makeRequestSpy.mockImplementation((_config: any) => {
          callIndex++;
          // Second call is claude (translate) — return claude-style response
          if (callIndex === 2) {
            return Promise.resolve(SUCCESS_RESPONSE_CLAUDE);
          }
          return Promise.resolve(SUCCESS_RESPONSE);
        });

        const summarize = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai"
        });
        const translate = wrap((text: string) => text, {
          task: "translate",
          provider: "claude",
          targetLanguage: "fr"
        } as any);

        const summary = await summarize(TEST_INPUTS.long);
        const translation = await translate(summary.output);

        expect(summary.meta.provider).toBe("openai");
        expect(translation.meta.provider).toBe("claude");
        expect(translation.meta.task).toBe("translate");
      },
      TEST_TIMEOUT
    );
  });

  // ── Provider Availability Detection ────────────────────────────────────────

  describe("Provider Availability Detection", () => {
    test("should detect all available providers", () => {
      initAIHooks({
        providers: [
          { provider: "openrouter", key: "sk-or-valid-key" },
          { provider: "openai",     key: "sk-valid-key" },
          { provider: "claude",     key: "sk-valid-key" },
          { provider: "gemini",     key: "AIza-valid-key" },
          { provider: "groq",       key: "gr-valid-key" }
        ]
      });

      const providers = getAvailableProviders();

      expect(providers).toContain("openrouter");
      expect(providers).toContain("groq");
      expect(providers).toContain("openai");
      expect(providers).toContain("gemini");
      expect(providers).toContain("claude");
      expect(providers.length).toBe(5);
    });

    test("should handle partial provider availability", () => {
      initAIHooks({
        providers: [
          { provider: "openai", key: "sk-valid-key" },
          { provider: "groq",   key: "gr-valid-key" }
        ]
      });

      const providers = getAvailableProviders();

      expect(providers).toContain("groq");
      expect(providers).toContain("openai");
      expect(providers.length).toBe(2);
    });

    test("should handle no provider availability", () => {
      // reset() already called in beforeEach — no initAIHooks called here.
      // getAvailableProviders() falls back to legacy system which reads env vars.
      // All env vars are absent → empty array.
      const providers = getAvailableProviders();
      expect(providers).toEqual([]);
    });
  });

  // ── Concurrent Operations ───────────────────────────────────────────────────

  describe("Concurrent Operations", () => {
    test(
      "should handle multiple concurrent requests",
      async () => {
        initAIHooks({
          providers: [{ provider: "openai", key: "sk-valid-key" }]
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

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
      },
      TEST_TIMEOUT
    );

    test(
      "should handle mixed success and failure scenarios",
      async () => {
        // Run sequentially so spy call order is deterministic.
        // summarize1 (openai) → success
        // summarize2 (openai only, no groq) → fails because openai errors AND chain exhausted
        // summarize3 (groq) → success
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-valid-key" },
            { provider: "groq",   key: "gr-valid-key" }
          ]
        });

        // summarize1 succeeds
        makeRequestSpy
          .mockResolvedValueOnce({ data: { choices: [{ message: { content: "Success 1" } }] } })
          // summarize2 — openai call fails, then groq fallback also fails
          .mockRejectedValueOnce(error401()) // openai
          .mockRejectedValueOnce(error401()) // groq (fallback from openai pin)
          // summarize3 — groq call succeeds
          .mockResolvedValueOnce({ data: { choices: [{ message: { content: "Success 2" } }] } });

        const summarize1 = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai"
        });
        // summarize2 has no provider pin — will start from openrouter-preferred chain
        // but we only have openai+groq; both fail → rejected
        const summarize2 = wrap((text: string) => text, {
          task: "summarize"
          // No provider pin — chain is: openai → groq (openrouter not present)
        });
        const summarize3 = wrap((text: string) => text, {
          task: "summarize",
          provider: "groq"
        });

        // Run sequentially to guarantee spy call ordering
        const result1 = await summarize1(TEST_INPUTS.short).then(
          v => ({ status: "fulfilled" as const, value: v }),
          e => ({ status: "rejected" as const, reason: e })
        );
        const result2 = await summarize2(TEST_INPUTS.medium).then(
          v => ({ status: "fulfilled" as const, value: v }),
          e => ({ status: "rejected" as const, reason: e })
        );
        const result3 = await summarize3(TEST_INPUTS.long).then(
          v => ({ status: "fulfilled" as const, value: v }),
          e => ({ status: "rejected" as const, reason: e })
        );

        expect(result1.status).toBe("fulfilled");
        expect(result2.status).toBe("rejected");
        expect(result3.status).toBe("fulfilled");
      },
      TEST_TIMEOUT
    );
  });

  // ── Model Selection ─────────────────────────────────────────────────────────

  describe("Model Selection", () => {
    test(
      "should use default model when none specified",
      async () => {
        initAIHooks({
          providers: [{ provider: "openai", key: "sk-valid-key" }]
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

        const summarize = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai"
        });

        const result = await summarize(TEST_INPUTS.short);

        expect(result.meta.model).toBeDefined();
        expect(result.meta.provider).toBe("openai");
      },
      TEST_TIMEOUT
    );

    test(
      "should use specified model when provided",
      async () => {
        initAIHooks({
          providers: [{ provider: "openai", key: "sk-valid-key" }]
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

        const summarize = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai",
          model: "gpt-4"
        });

        const result = await summarize(TEST_INPUTS.short);

        expect(result.meta.model).toBe("gpt-4");
        expect(result.meta.provider).toBe("openai");
      },
      TEST_TIMEOUT
    );
  });

  // ── Caching Integration ─────────────────────────────────────────────────────

  describe("Caching Integration", () => {
    test(
      "should handle caching across different providers",
      async () => {
        initAIHooks({
          providers: [
            { provider: "openai", key: "sk-valid-key" },
            { provider: "groq",   key: "gr-valid-key" }
          ]
        });

        makeRequestSpy.mockResolvedValue(SUCCESS_RESPONSE);

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
      },
      TEST_TIMEOUT
    );
  });

  // ── Error Recovery ──────────────────────────────────────────────────────────

  describe("Error Recovery", () => {
    test(
      "should recover from temporary failures",
      async () => {
        // Only one provider so the 503 is not retried via fallback — it surfaces.
        // The second direct call to summarize() succeeds because spy returns success.
        initAIHooks({
          providers: [{ provider: "openai", key: "sk-valid-key" }]
        });

        makeRequestSpy
          .mockRejectedValueOnce(error503())   // first call: temporary failure
          .mockResolvedValueOnce(SUCCESS_RESPONSE); // second call: success

        const summarize = wrap((text: string) => text, {
          task: "summarize",
          provider: "openai"
        });

        // First call should fail
        await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();

        // Second call should succeed
        const result = await summarize(TEST_INPUTS.short);
        expect(result.output).toBe(MOCK_RESPONSE);
      },
      TEST_TIMEOUT
    );
  });
});
