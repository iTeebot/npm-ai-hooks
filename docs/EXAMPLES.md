# Usage Examples – npm-ai-hooks

This document provides comprehensive examples of how to use npm-ai-hooks in various scenarios. The library works seamlessly in both Node.js (Express) and React (Vite) environments.

## Quick Start

### Basic Setup

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

// Initialize providers
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-openai-key-here' },
    { provider: 'claude', key: 'sk-ant-your-claude-key-here' }
  ]
});

// Use AI-powered functions
const summarize = wrap((text: string) => text, { task: "summarize" });
const result = await summarize("Your text here...");
```

## React Frontend Example

```typescript
import React, { useState } from 'react';
import { initAIHooks, wrap } from "npm-ai-hooks";

// Initialize providers (do this once in your app)
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-openai-key-here' },
    { provider: 'claude', key: 'sk-ant-your-claude-key-here' }
  ]
});

const summarize = wrap((text: string) => text, { task: "summarize" });
const translate = wrap((text: string) => text, { 
  task: "translate", 
  targetLanguage: "spanish" 
});

export function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await summarize("Explain server components in React and how they improve performance.");
      setResult(res);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await translate("Hello, how are you?");
      setResult(res);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate to Spanish'}
      </button>
      <p>{result}</p>
    </div>
  );
}
```

## ⚙️ Node.js Backend Example

### Express.js API

```typescript
import express from 'express';
import { initAIHooks, wrap } from "npm-ai-hooks";

// Initialize providers
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-openai-key-here' },
    { provider: 'claude', key: 'sk-ant-your-claude-key-here' },
    { provider: 'groq', key: 'gsk_your-groq-key-here' }
  ],
  defaultProvider: 'openai'
});

const app = express();
app.use(express.json());

// AI-powered functions
const summarize = wrap((text: string) => text, { task: "summarize" });
const explain = wrap((text: string) => text, { task: "explain" });
const codeReview = wrap((code: string) => code, { task: "codeReview" });

// API endpoints
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    const result = await summarize(text);
    res.json({ summary: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/explain", async (req, res) => {
  try {
    const { text } = req.body;
    const result = await explain(text);
    res.json({ explanation: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/code-review", async (req, res) => {
  try {
    const { code } = req.body;
    const result = await codeReview(code);
    res.json({ review: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Next.js API Routes

```typescript
// pages/api/ai/summarize.ts
import { initAIHooks, wrap } from "npm-ai-hooks";

// Initialize providers
initAIHooks({
  providers: [
    { provider: 'openai', key: process.env.OPENAI_API_KEY! },
    { provider: 'claude', key: process.env.CLAUDE_API_KEY! }
  ]
});

const summarize = wrap((text: string) => text, { task: "summarize" });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    const result = await summarize(text);
    res.status(200).json({ summary: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🔄 AI Pipeline Example

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' },
    { provider: 'claude', key: 'sk-ant-your-key-here' }
  ]
});

// Create AI pipeline functions
const summarize = wrap((text: string) => text, { task: "summarize" });
const translate = wrap((text: string) => text, { 
  task: "translate", 
  targetLanguage: "french" 
});
const rewrite = wrap((text: string) => text, { task: "rewrite" });

// Pipeline function
async function processText(text: string) {
  try {
    // Step 1: Summarize
    const summary = await summarize(text);
    console.log("Summary:", summary);

    // Step 2: Translate to French
    const translated = await translate(summary);
    console.log("Translated:", translated);

    // Step 3: Rewrite for clarity
    const rewritten = await rewrite(translated);
    console.log("Rewritten:", rewritten);

    return {
      original: text,
      summary,
      translated,
      rewritten
    };
  } catch (error) {
    console.error("Pipeline error:", error.message);
    throw error;
  }
}

// Usage
processText("Long article about artificial intelligence...")
  .then(result => console.log("Pipeline complete:", result))
  .catch(error => console.error("Pipeline failed:", error));
```

## Provider-Specific Examples

### Using Specific Providers

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here', defaultModel: 'gpt-4' },
    { provider: 'claude', key: 'sk-ant-your-key-here', defaultModel: 'claude-3-sonnet-20240229' },
    { provider: 'groq', key: 'gsk_your-key-here', defaultModel: 'llama-3.1-70b-versatile' }
  ]
});

// Use specific providers
const openaiSummarize = wrap((text: string) => text, { 
  task: "summarize", 
  provider: "openai" 
});

const claudeExplain = wrap((text: string) => text, { 
  task: "explain", 
  provider: "claude" 
});

const groqTranslate = wrap((text: string) => text, { 
  task: "translate", 
  targetLanguage: "spanish",
  provider: "groq" 
});
```

### Dynamic Provider Management

```typescript
import { initAIHooks, addProvider, removeProvider, getAvailableProviders } from "npm-ai-hooks";

// Initial setup
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' }
  ]
});

// Add more providers dynamically
addProvider({ 
  provider: 'mistral', 
  key: 'your-mistral-key', 
  defaultModel: 'mistral-large' 
});

addProvider({ 
  provider: 'perplexity', 
  key: 'pplx-your-key' 
});

// Check available providers
console.log("Available providers:", getAvailableProviders());
// Output: ['openai', 'mistral', 'perplexity']

// Remove a provider
removeProvider('mistral');
console.log("After removal:", getAvailableProviders());
// Output: ['openai', 'perplexity']
```

## 🧪 Testing Examples

### Unit Tests

```typescript
import { initAIHooks, wrap, reset } from "npm-ai-hooks";

describe("AI Functions", () => {
  beforeEach(() => {
    reset(); // Reset provider system
    initAIHooks({
      providers: [
        { provider: 'openai', key: 'sk-test-key' }
      ]
    });
  });

  test("should summarize text", async () => {
    const summarize = wrap((text: string) => text, { task: "summarize" });
    
    // Mock the API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Test summary" } }]
      })
    });

    const result = await summarize("Test text");
    expect(result).toBe("Test summary");
  });
});
```

### Integration Tests

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

describe("AI Integration", () => {
  beforeAll(() => {
    initAIHooks({
      providers: [
        { provider: 'openai', key: process.env.OPENAI_API_KEY! }
      ]
    });
  });

  test("should work with real API", async () => {
    const summarize = wrap((text: string) => text, { task: "summarize" });
    
    const result = await summarize("This is a test text for summarization.");
    
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  }, 10000); // 10 second timeout for real API call
});
```

## 🔧 Advanced Configuration

### Custom Error Handling

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' }
  ]
});

const summarize = wrap((text: string) => text, { task: "summarize" });

async function safeSummarize(text: string) {
  try {
    return await summarize(text);
  } catch (error) {
    if (error.code === 'RATE_LIMIT') {
      console.log("Rate limited, retrying in 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await summarize(text);
    } else if (error.code === 'INVALID_API_KEY') {
      throw new Error("Please check your API key configuration");
    } else {
      throw error;
    }
  }
}
```

### Batch Processing

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' }
  ]
});

const summarize = wrap((text: string) => text, { task: "summarize" });

async function batchSummarize(texts: string[]) {
  const results = await Promise.all(
    texts.map(text => summarize(text))
  );
  return results;
}

// Usage
const texts = [
  "First article about AI...",
  "Second article about machine learning...",
  "Third article about deep learning..."
];

const summaries = await batchSummarize(texts);
console.log("All summaries:", summaries);
```

## Performance Tips

### 1. Initialize Once
```typescript
// ✅ Good: Initialize once at app startup
import { initAIHooks } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' }
  ]
});

// ❌ Bad: Don't initialize in every function call
function badExample() {
  initAIHooks({ providers: [...] }); // Don't do this
}
```

### 2. Use Appropriate Providers
```typescript
// ✅ Good: Use faster providers for simple tasks
const quickSummarize = wrap(fn, { 
  task: "summarize", 
  provider: "groq" // Faster for simple tasks
});

// ✅ Good: Use powerful providers for complex tasks
const complexExplain = wrap(fn, { 
  task: "explain", 
  provider: "claude" // Better for complex reasoning
});
```

### 3. Handle Errors Gracefully
```typescript
const summarize = wrap((text: string) => text, { task: "summarize" });

async function robustSummarize(text: string) {
  try {
    return await summarize(text);
  } catch (error) {
    console.error("Summarization failed:", error.message);
    return "Unable to summarize at this time.";
  }
}
```

## 📚 More Examples

Check out the `examples/` directory in the repository for more detailed examples:

- `examples/basic/` - Basic usage examples
- `examples/express/` - Express.js server example
- `examples/openrouter/` - OpenRouter-specific examples
- `examples/new-initialization.ts` - New initialization system examples

## 🤝 Contributing Examples

Have a great example? We'd love to see it! Please submit a pull request with your example or open an issue to suggest new examples.