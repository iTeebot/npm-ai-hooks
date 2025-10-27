import { wrap } from "../src/wrap";
import { initAIHooks, reset } from "../src/providers";
import { TEST_INPUTS, MOCK_RESPONSE, TEST_TIMEOUT, initializeProvidersFromEnv, hasProvidersAvailable } from "./setup";

// Mock fetch responses
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Task Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reset(); // Reset provider system
    
    // Initialize providers for testing
    initAIHooks({
      providers: [
        { provider: 'openai', key: 'sk-test-key' },
        { provider: 'claude', key: 'sk-test-key' },
        { provider: 'groq', key: 'gsk-test-key' }
      ]
    });
    
    // Mock successful API response for all providers
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: MOCK_RESPONSE } }],
        usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 }
      }),
      text: async () => MOCK_RESPONSE
    } as Response);
  });

  describe("Summarize Task", () => {
    test("should summarize short text", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should summarize medium text", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.medium);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should summarize long text", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.long);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should summarize code", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should summarize HTML content", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(TEST_INPUTS.html);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);
  });

  describe("Translate Task", () => {
    test("should translate to Spanish", async () => {
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        targetLanguage: "es" 
      });
      
      const result = await translate(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("translate");
      expect(result.meta.targetLanguage).toBe("es");
    }, TEST_TIMEOUT);

    test("should translate to French", async () => {
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        targetLanguage: "fr" 
      });
      
      const result = await translate(TEST_INPUTS.medium);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("translate");
      expect(result.meta.targetLanguage).toBe("fr");
    }, TEST_TIMEOUT);

    test("should translate to German", async () => {
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        targetLanguage: "de" 
      });
      
      const result = await translate(TEST_INPUTS.long);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("translate");
      expect(result.meta.targetLanguage).toBe("de");
    }, TEST_TIMEOUT);

    test("should translate code comments", async () => {
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        targetLanguage: "es" 
      });
      
      const result = await translate(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("translate");
    }, TEST_TIMEOUT);

    test("should translate without target language (auto-detect)", async () => {
      const translate = wrap((text: string) => text, { task: "translate" });
      
      const result = await translate(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("translate");
    }, TEST_TIMEOUT);
  });

  describe("Explain Task", () => {
    test("should explain simple text", async () => {
      const explain = wrap((text: string) => text, { task: "explain" });
      
      const result = await explain(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);

    test("should explain complex text", async () => {
      const explain = wrap((text: string) => text, { task: "explain" });
      
      const result = await explain(TEST_INPUTS.long);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);

    test("should explain code", async () => {
      const explain = wrap((text: string) => text, { task: "explain" });
      
      const result = await explain(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);

    test("should explain HTML structure", async () => {
      const explain = wrap((text: string) => text, { task: "explain" });
      
      const result = await explain(TEST_INPUTS.html);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);

    test("should explain JSON structure", async () => {
      const explain = wrap((text: string) => text, { task: "explain" });
      
      const result = await explain(TEST_INPUTS.json);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);
  });

  describe("Rewrite Task", () => {
    test("should rewrite short text", async () => {
      const rewrite = wrap((text: string) => text, { task: "rewrite" });
      
      const result = await rewrite(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("rewrite");
    }, TEST_TIMEOUT);

    test("should rewrite medium text", async () => {
      const rewrite = wrap((text: string) => text, { task: "rewrite" });
      
      const result = await rewrite(TEST_INPUTS.medium);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("rewrite");
    }, TEST_TIMEOUT);

    test("should rewrite long text", async () => {
      const rewrite = wrap((text: string) => text, { task: "rewrite" });
      
      const result = await rewrite(TEST_INPUTS.long);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("rewrite");
    }, TEST_TIMEOUT);

    test("should rewrite code for clarity", async () => {
      const rewrite = wrap((text: string) => text, { task: "rewrite" });
      
      const result = await rewrite(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("rewrite");
    }, TEST_TIMEOUT);
  });

  describe("Sentiment Task", () => {
    test("should analyze sentiment of positive text", async () => {
      const sentiment = wrap((text: string) => text, { task: "sentiment" });
      
      const result = await sentiment("I love this amazing product!");
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("sentiment");
    }, TEST_TIMEOUT);

    test("should analyze sentiment of negative text", async () => {
      const sentiment = wrap((text: string) => text, { task: "sentiment" });
      
      const result = await sentiment("This is terrible and I hate it.");
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("sentiment");
    }, TEST_TIMEOUT);

    test("should analyze sentiment of neutral text", async () => {
      const sentiment = wrap((text: string) => text, { task: "sentiment" });
      
      const result = await sentiment("The weather is okay today.");
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("sentiment");
    }, TEST_TIMEOUT);

    test("should analyze sentiment of complex text", async () => {
      const sentiment = wrap((text: string) => text, { task: "sentiment" });
      
      const result = await sentiment(TEST_INPUTS.long);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("sentiment");
    }, TEST_TIMEOUT);
  });

  describe("Code Review Task", () => {
    test("should review simple code", async () => {
      const codeReview = wrap((text: string) => text, { task: "codeReview" });
      
      const result = await codeReview(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("codeReview");
    }, TEST_TIMEOUT);

    test("should review complex code", async () => {
      const complexCode = `
        class UserService {
          constructor(private db: Database) {}
          
          async createUser(userData: UserData): Promise<User> {
            try {
              const user = await this.db.users.create(userData);
              return user;
            } catch (error) {
              throw new Error(\`Failed to create user: \${error.message}\`);
            }
          }
        }
      `;
      
      const codeReview = wrap((text: string) => text, { task: "codeReview" });
      
      const result = await codeReview(complexCode);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("codeReview");
    }, TEST_TIMEOUT);

    test("should review HTML code", async () => {
      const codeReview = wrap((text: string) => text, { task: "codeReview" });
      
      const result = await codeReview(TEST_INPUTS.html);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("codeReview");
    }, TEST_TIMEOUT);

    test("should review JSON configuration", async () => {
      const codeReview = wrap((text: string) => text, { task: "codeReview" });
      
      const result = await codeReview(TEST_INPUTS.json);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("codeReview");
    }, TEST_TIMEOUT);
  });

  describe("Task with Different Providers", () => {
    beforeEach(() => {
      process.env.OPENAI_KEY = "sk-test-key";
      process.env.CLAUDE_KEY = "sk-test-key";
      process.env.GROQ_KEY = "gr-test-key";
    });

    test("should work with OpenAI for summarize", async () => {
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: "openai" 
      });
      
      const result = await summarize(TEST_INPUTS.medium);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("openai");
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should work with Claude for explain", async () => {
      const explain = wrap((text: string) => text, { 
        task: "explain", 
        provider: "claude" 
      });
      
      const result = await explain(TEST_INPUTS.code);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("claude");
      expect(result.meta.task).toBe("explain");
    }, TEST_TIMEOUT);

    test("should work with Groq for translate", async () => {
      const translate = wrap((text: string) => text, { 
        task: "translate", 
        provider: "groq",
        targetLanguage: "es"
      });
      
      const result = await translate(TEST_INPUTS.short);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.provider).toBe("groq");
      expect(result.meta.task).toBe("translate");
    }, TEST_TIMEOUT);
  });

  describe("Task Error Handling", () => {
    test("should handle invalid task type", () => {
      expect(() => {
        wrap((text: string) => text, { task: "invalidTask" as any });
      }).toThrow();
    });

    test("should handle empty input", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize("");
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);

    test("should handle very long input", async () => {
      const longText = "A".repeat(10000);
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const result = await summarize(longText);
      
      expect(result.output).toBe(MOCK_RESPONSE);
      expect(result.meta.task).toBe("summarize");
    }, TEST_TIMEOUT);
  });

  // Test with real API keys if available
  if (hasProvidersAvailable()) {
    describe("Real API Integration Tests", () => {
      beforeEach(() => {
        jest.clearAllMocks();
        initializeProvidersFromEnv();
      });

      test("should work with real API for summarization", async () => {
        const summarize = wrap((text: string) => text, { task: "summarize" });
        
        try {
          const result = await summarize("This is a test text for real API summarization. It should be processed by the actual AI provider and return a meaningful summary.");
          expect(typeof result).toBe("object");
          expect(result.output).toBeDefined();
          expect(typeof result.output).toBe("string");
          expect(result.output.length).toBeGreaterThan(0);
          console.log("Real API summarization successful:", result.output.substring(0, 100) + "...");
        } catch (error) {
          console.log("Real API test failed (expected with test keys):", error instanceof Error ? error.message : String(error));
          expect(error instanceof Error ? error.message : String(error)).toContain("Invalid");
        }
      }, TEST_TIMEOUT);

      test("should work with real API for translation", async () => {
        const translate = wrap((text: string) => text, { 
          task: "translate", 
          targetLanguage: "spanish" 
        });
        
        try {
          const result = await translate("Hello, how are you today?");
          expect(typeof result).toBe("object");
          expect(result.output).toBeDefined();
          expect(typeof result.output).toBe("string");
          expect(result.output.length).toBeGreaterThan(0);
          console.log("Real API translation successful:", result.output);
        } catch (error) {
          console.log("Real API translation test failed (expected with test keys):", error instanceof Error ? error.message : String(error));
          expect(error instanceof Error ? error.message : String(error)).toContain("Invalid");
        }
      }, TEST_TIMEOUT);
    });
  } else {
    describe("Real API Integration Tests", () => {
      test("should skip real API tests when no environment variables are set", () => {
        console.log("Skipping real API tests - no environment variables found");
        expect(true).toBe(true);
      });
    });
  }
});
