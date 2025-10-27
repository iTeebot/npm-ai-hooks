import { wrap } from "../src/wrap";
import { TEST_INPUTS, TEST_TIMEOUT } from "./setup";

// Mock fetch responses
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Performance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_KEY = "sk-valid-key";
    
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Mock response" } }],
        usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 }
      })
    } as Response);
  });

  describe("Response Time Performance", () => {
    test("should complete requests within reasonable time", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const startTime = Date.now();
      const result = await summarize(TEST_INPUTS.medium);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(result.output).toBe("Mock response");
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    }, TEST_TIMEOUT);

    test("should handle multiple requests efficiently", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const startTime = Date.now();
      const promises = Array.from({ length: 10 }, () => 
        summarize(TEST_INPUTS.short)
      );
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 10;
      
      expect(results).toHaveLength(10);
      expect(averageTime).toBeLessThan(1000); // Average should be less than 1 second
    }, TEST_TIMEOUT);

    test("should handle large input efficiently", async () => {
      const largeText = "A".repeat(50000); // 50KB text
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const startTime = Date.now();
      const result = await summarize(largeText);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(result.output).toBe("Mock response");
      expect(responseTime).toBeLessThan(10000); // Should complete within 10 seconds
    }, TEST_TIMEOUT);
  });

  describe("Memory Usage", () => {
    test("should not leak memory with repeated calls", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await summarize(TEST_INPUTS.short);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, TEST_TIMEOUT);

    test("should handle concurrent requests without memory issues", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 50 concurrent requests
      const promises = Array.from({ length: 50 }, () => 
        summarize(TEST_INPUTS.medium)
      );
      await Promise.all(promises);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    }, TEST_TIMEOUT);
  });

  describe("Throughput Performance", () => {
    test("should handle high throughput", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      const startTime = Date.now();
      const requestsPerSecond = 10;
      const totalRequests = 50;
      
      const promises = Array.from({ length: totalRequests }, (_, i) => {
        // Stagger requests to simulate realistic load
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(summarize(`Request ${i + 1}`));
          }, (i / requestsPerSecond) * 1000);
        });
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const actualRPS = (totalRequests / totalTime) * 1000;
      
      expect(results).toHaveLength(totalRequests);
      expect(actualRPS).toBeGreaterThan(5); // Should handle at least 5 RPS
    }, TEST_TIMEOUT);
  });

  describe("Provider Performance Comparison", () => {
    beforeEach(() => {
      process.env.OPENAI_KEY = "sk-valid-key";
      process.env.GROQ_KEY = "gr-valid-key";
      process.env.CLAUDE_KEY = "sk-valid-key";
    });

    test("should measure performance across different providers", async () => {
      const providers = ["openai", "groq", "claude"] as const;
      const results: { provider: string; time: number }[] = [];
      
      for (const provider of providers) {
        const summarize = wrap((text: string) => text, { 
          task: "summarize", 
          provider 
        });
        
        const startTime = Date.now();
        await summarize(TEST_INPUTS.medium);
        const endTime = Date.now();
        
        results.push({
          provider,
          time: endTime - startTime
        });
      }
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.time).toBeLessThan(5000);
      });
    }, TEST_TIMEOUT);
  });

  describe("Task Performance Comparison", () => {
    test("should measure performance across different tasks", async () => {
      const tasks = ["summarize", "translate", "explain", "rewrite", "sentiment", "codeReview"] as const;
      const results: { task: string; time: number }[] = [];
      
      for (const task of tasks) {
        const wrapped = wrap((text: string) => text, { 
          task,
          targetLanguage: task === "translate" ? "es" : undefined
        });
        
        const startTime = Date.now();
        await wrapped(TEST_INPUTS.medium);
        const endTime = Date.now();
        
        results.push({
          task,
          time: endTime - startTime
        });
      }
      
      expect(results).toHaveLength(6);
      results.forEach(result => {
        expect(result.time).toBeLessThan(5000);
      });
    }, TEST_TIMEOUT);
  });

  describe("Error Recovery Performance", () => {
    test("should recover quickly from errors", async () => {
      const summarize = wrap((text: string) => text, { task: "summarize" });
      
      // Mock error followed by success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ error: { message: "Rate limit exceeded" } })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "Success after error" } }],
            usage: { total_tokens: 100 }
          })
        } as Response);
      
      const startTime = Date.now();
      
      // First call should fail
      await expect(summarize(TEST_INPUTS.short)).rejects.toThrow();
      
      // Second call should succeed quickly
      const result = await summarize(TEST_INPUTS.short);
      const endTime = Date.now();
      
      const recoveryTime = endTime - startTime;
      
      expect(result.output).toBe("Success after error");
      expect(recoveryTime).toBeLessThan(3000); // Should recover within 3 seconds
    }, TEST_TIMEOUT);
  });
});
