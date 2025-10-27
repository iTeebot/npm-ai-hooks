# npm-ai-hooks

**Universal AI Hook Layer for Node.js and React – one wrapper for all AI providers.**

Inject LLM-like behavior into any JavaScript or TypeScript function with a single line, without writing prompts, handling SDKs, or locking into any provider. Works seamlessly in both Node.js (Express) and React (Vite) environments.

📚 **[View Homepage & Demos](https://labs.iteebot.com/npm-packages/npm-ai-hooks)** | 🎮 **[React Example](https://labs.iteebot.com/npm-packages/npm-ai-hooks/demo)** | 💻 **[Node.js Example](./examples/demo.ts)**

---

## Features

* **Universal API:** Works with OpenAI, Claude, Gemini, DeepSeek, Groq, OpenRouter, XAI, Perplexity, and Mistral — out of the box.
* **Cross-Platform:** Works in both Node.js (Express) and React (Vite) environments with dual build system.
* **Multimodal Support:** 🆕 Images, files, and voice input support with vision-enabled models.
* **Plug & Play:** Wrap any function and instantly give it AI-powered behavior.
* **Zero Prompting:** Built-in task templates (summarize, explain, translate, sentiment, rewrite, code-review, etc.)
* **Explicit Configuration:** No environment variables needed - initialize providers explicitly with API keys.
* **Auto Provider Selection:** Smart fallback system with configurable preferences.
* **Type Safe:** Full TypeScript support with IntelliSense and type checking.
* **Error Safe:** Handles invalid keys, unauthorized models, rate limits, and more gracefully.
* **Dynamic Management:** Add/remove providers at runtime.
* **Cost Awareness:** Estimate and log token usage and cost before and after calls.
* **Caching:** Prevents duplicate calls and charges by caching results intelligently.
* **Extensible:** Add your own providers and custom tasks easily.
* **Debug Friendly:** Full debug logging with `DEBUG=true`.

---

## Installation

```bash
npm install npm-ai-hooks
# or
yarn add npm-ai-hooks
```

---

## Quick Start

### 1. Initialize Providers

```typescript
import { initAIHooks, wrap } from "npm-ai-hooks";

// Initialize with your API keys
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-openai-key-here' },
    { provider: 'claude', key: 'sk-ant-your-claude-key-here' },
    { provider: 'groq', key: 'gsk_your-groq-key-here' }
  ],
  defaultProvider: 'openai' // optional
});
```

### 2. Wrap Any Function

```typescript
// Wrap any function with AI behavior
const summarize = wrap((text: string) => text, { task: "summarize" });

// Use it
const result = await summarize("Node.js is a JavaScript runtime built on Chrome's V8...");
console.log(result); // "Node.js is a JS runtime for building server-side apps."
```

---

## 🔧 Provider Initialization

### Basic Setup

```typescript
import { initAIHooks } from "npm-ai-hooks";

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-...' },
    { provider: 'claude', key: 'sk-ant-...' }
  ]
});
```

### Advanced Setup with Custom Models

```typescript
initAIHooks({
  providers: [
    { 
      provider: 'openai', 
      key: 'sk-...',
      defaultModel: 'gpt-4' // custom default model
    },
    { 
      provider: 'claude', 
      key: 'sk-ant-...',
      defaultModel: 'claude-3-sonnet-20240229'
    }
  ],
  defaultProvider: 'openai' // preferred provider
});
```

### Dynamic Provider Management

```typescript
import { addProvider, removeProvider, getAvailableProviders } from "npm-ai-hooks";

// Add providers after initialization
addProvider({ 
  provider: 'mistral', 
  key: '...', 
  defaultModel: 'mistral-large' 
});

// Remove providers
removeProvider('mistral');

// Check available providers
console.log(getAvailableProviders()); // ['openai', 'claude', 'groq', 'mistral']
```

---

## React/Vite Support

The library works seamlessly in React applications with Vite. The dual build system automatically provides the correct module format.

### React Setup

```typescript
// App.tsx
import { useState, useEffect } from 'react';
import { initAIHooks, wrap } from 'npm-ai-hooks';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize with Vite environment variables (VITE_ prefix required)
    initAIHooks({
      providers: [
        { provider: 'openai', key: import.meta.env.VITE_OPENAI_KEY },
        { provider: 'groq', key: import.meta.env.VITE_GROQ_KEY },
        { provider: 'claude', key: import.meta.env.VITE_CLAUDE_KEY }
      ],
      defaultProvider: 'groq'
    });
    setIsInitialized(true);
  }, []);

  const handleSummarize = async () => {
    const summarize = wrap((text: string) => text, { task: "summarize" });
    const result = await summarize("Your text here...");
    console.log(result.output);
  };

  return (
    <div>
      <button onClick={handleSummarize} disabled={!isInitialized}>
        Summarize Text
      </button>
    </div>
  );
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..', '../..'] // Allow access to parent directories for local library
    }
  }
})
```

---

## Usage Examples

### 1. Basic Tasks

```typescript
import { wrap } from "npm-ai-hooks";

// Summarization
const summarize = wrap((text: string) => text, { task: "summarize" });
console.log(await summarize("Long article text..."));

// Translation
const translate = wrap((text: string) => text, { 
  task: "translate", 
  targetLanguage: "spanish" 
});
console.log(await translate("Hello world"));

// Code Review
const codeReview = wrap((code: string) => code, { task: "codeReview" });
console.log(await codeReview("function add(a, b) { return a + b; }"));
```

### 2. Provider-Specific Usage

```typescript
// Use specific provider
const explain = wrap((text: string) => text, {
  task: "explain",
  provider: "claude",
  model: "claude-3-opus"
});

console.log(await explain("Explain quantum computing like I'm 10."));
```

### 3. AI Pipelines

```typescript
const summarize = wrap((t: string) => t, { task: "summarize" });
const translate = wrap((t: string) => t, { task: "translate", targetLanguage: "fr" });

// Chain operations
const result = await translate(await summarize("Long technical article..."));
console.log(result); // Résumé en français
```

### 4. Multimodal Support (Images, Files, Voice) 🎨🎤

**NEW!** npm-ai-hooks now supports multimodal inputs including images, files, and voice.

```typescript
import { wrap, MultimodalInput } from "npm-ai-hooks";
import * as fs from 'fs';

// Image Analysis
const analyzeImage = wrap((input: MultimodalInput) => input, {
  provider: 'openai',
  model: 'gpt-4o', // Vision-enabled model
  customPrompt: 'Describe what you see in this image'
});

// Load and encode image
const imageBuffer = fs.readFileSync('./photo.jpg');
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

const result = await analyzeImage({
  text: 'What is in this image?',
  image: base64Image
});
console.log(result.output); // Detailed image description

// OCR (Text Extraction)
const extractText = wrap((input: MultimodalInput) => input, {
  provider: 'openai',
  model: 'gpt-4o',
  customPrompt: 'Extract all text from this image'
});

const ocrResult = await extractText({
  text: 'Extract text from this document',
  image: base64Image
});

// File Processing
const analyzeFile = wrap((input: MultimodalInput) => input, {
  provider: 'claude',
  model: 'claude-3-opus',
  task: 'summarize'
});

const fileBuffer = fs.readFileSync('./document.pdf');
const fileResult = await analyzeFile({
  text: 'Summarize this document',
  file: {
    name: 'document.pdf',
    data: `data:application/pdf;base64,${fileBuffer.toString('base64')}`,
    type: 'application/pdf'
  }
});
```

**Browser Voice Input (Web Speech API):**
```typescript
// In browser environment
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  
  // Process voice input with AI
  const explain = wrap((text: string) => text, { task: 'explain' });
  const result = await explain(transcript);
  console.log(result.output);
};

recognition.start();
```

**Multimodal Interface:**
```typescript
interface MultimodalInput {
  text?: string;           // Text content
  image?: string;          // Base64 encoded image (with data URI)
  file?: {                 // File attachment
    name: string;          // File name
    data: string;          // Base64 encoded (with data URI)
    type: string;          // MIME type
  };
}
```

**Use Cases:**
- 📸 Image analysis and description
- 📄 OCR and document processing
- 🔍 Code review from screenshots
- 🎤 Voice commands and transcription
- 📊 Chart and diagram analysis
- 🏷️ Product image tagging

**See full examples:**
- [Vision Examples](./examples/multimodal/vision-example.ts)
- [Voice Examples](./examples/multimodal/voice-example.ts)
- [React Demo with UI](https://labs.iteebot.com/npm-packages/npm-ai-hooks/demo)

### 5. Error Handling

```typescript
try {
  const result = await summarize("Some text");
} catch (error) {
  console.error(error);
  /*
  {
    code: "INVALID_API_KEY",
    message: "Invalid OpenAI API key: ...",
    provider: "openai",
    suggestion: "Verify your API key"
  }
  */
}
```

---

## 🎯 Built-in Tasks

| Task         | Description                              | Example |
| ------------ | ---------------------------------------- | ------- |
| `summarize`  | Summarize text into concise form         | `wrap(fn, { task: "summarize" })` |
| `translate`  | Translate text to a target language      | `wrap(fn, { task: "translate", targetLanguage: "es" })` |
| `explain`    | Explain complex text simply              | `wrap(fn, { task: "explain" })` |
| `rewrite`    | Rephrase text for tone/clarity           | `wrap(fn, { task: "rewrite" })` |
| `sentiment`  | Analyze emotional tone of text           | `wrap(fn, { task: "sentiment" })` |
| `codeReview` | Review code and provide feedback         | `wrap(fn, { task: "codeReview" })` |

---

## 🤖 Supported Providers

| Provider    | Key Format Example        | Default Model           |
| ----------- | ------------------------- | ----------------------- |
| OpenRouter  | `sk-or-...`               | `openai/gpt-4o-mini`    |
| Groq        | `gsk_...`                 | `llama-3.1-70b-versatile` |
| OpenAI      | `sk-...`                  | `gpt-4o`                |
| Gemini      | `AIza...`                 | `gemini-1.5-flash`      |
| Claude      | `sk-ant-...`              | `claude-3-5-sonnet-20241022` |
| DeepSeek    | `ds-...`                  | `deepseek-chat`         |
| XAI         | `xai-...`                 | `grok-2-1212`           |
| Perplexity  | `pplx-...`                | `sonar`                 |
| Mistral     | `mistral-...`             | `mistral-large-latest`  |

---

## ⚙️ Provider Selection Logic

The system follows this priority order:

1. **User-specified provider** (if available)
2. **Default provider** (if set during initialization)
3. **OpenRouter** (if available)
4. **First provider** in the initialization list

```typescript
// Example: OpenRouter will be selected if available
initAIHooks({
  providers: [
    { provider: 'groq', key: '...' },
    { provider: 'openrouter', key: '...' }, // This will be preferred
    { provider: 'openai', key: '...' }
  ]
});
```

---

## 🔍 Advanced Configuration

### Cost Awareness

```typescript
const summarize = wrap((t: string) => t, { task: "summarize" });
const result = await summarize(longText);

console.log(result.meta);
/*
{
  provider: "openai",
  model: "gpt-4o",
  cached: false,
  estimatedCostUSD: 0.0013,
  totalCostUSD: 0.0012,
  inputTokens: 326,
  outputTokens: 127,
  latencyMs: 812
}
*/
```

### Caching

```typescript
const summarize = wrap((t: string) => t, { 
  task: "summarize", 
  cache: true // Enable caching
});
```

### Debug Mode

```bash
DEBUG=true
```

Output:
```
[ai-hooks] Using provider: OpenAI (gpt-4o)
[ai-hooks] Estimated cost: $0.0012
[ai-hooks] Cache: MISS
[ai-hooks] Response received in 812ms
```

---

## 🔄 Migration from v1.x

### Old Way (v1.x)
```typescript
// Set environment variables
process.env.OPENAI_KEY = 'sk-...';

// Use providers
import { getProvider } from 'npm-ai-hooks';
const { fn } = getProvider();
```

### New Way (v2.0)
```typescript
// Initialize providers explicitly
import { initAIHooks, getProvider } from 'npm-ai-hooks';

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-...' }
  ]
});

// Use providers (same API)
const { fn } = getProvider();
```

### Benefits of Migration

- ✅ **No Environment Dependencies** - Cleaner, more explicit configuration
- ✅ **Better Security** - No accidental exposure of environment variables
- ✅ **Type Safety** - Full TypeScript support for provider configuration
- ✅ **Dynamic Management** - Add/remove providers at runtime
- ✅ **Custom Models** - Specify default models per provider
- ✅ **Smaller Bundle** - 77% reduction in code size

---

## 🧪 Development Setup

For contributors and developers:

```bash
# Clone the repository
git clone https://github.com/iTeebot/npm-ai-hooks.git
cd npm-ai-hooks

# Setup development environment
npm run setup:dev

# Or on Windows (PowerShell - recommended)
npm run setup:dev:ps

# Or on Windows (Command Prompt)
npm run setup:dev:win
```

The setup script will:
- Use the correct Node.js version from `.nvmrc`
- Apply npm configuration from `.npmrc`
- Install dependencies
- Run tests to verify everything works

### Testing with Real API Keys

To test with real API keys (optional):

```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Add your API keys to .env
# Edit .env and add your actual API keys

# 3. Run tests with real API keys
npm run test:env

# 4. Or run all tests (includes both mock and real API tests)
npm test
```

### Testing Commands

```bash
# Run all tests (mock + real API if available)
npm test

# Run only mock tests (no API keys needed)
npm run test:mock

# Run only real API tests (requires API keys in .env)
npm run test:env

# Run specific test suites
npm run test:providers
npm run test:tasks
npm run test:errors
npm run test:integration
npm run test:performance
```

---

## 🏗️ Project Structure

```
npm-ai-hooks/
├─ src/
│  ├─ index.ts                 # Main exports
│  ├─ wrap.ts                  # Core wrapping functionality
│  ├─ errors.ts                # Error handling
│  ├─ providers/
│  │   ├─ base/                # Base provider system
│  │   │   ├─ BaseProvider.ts  # Abstract base class
│  │   │   ├─ ProviderConfig.ts # Provider configuration
│  │   │   ├─ ProviderRegistry.ts # Provider management
│  │   │   └─ ProviderConfigs.ts # Provider definitions
│  │   └─ index.ts             # Provider exports
│  └─ types/                   # TypeScript definitions
├─ examples/                   # Usage examples
├─ tests/                      # Test suite
├─ package.json
├─ README.md
└─ LICENSE
```

---

## 🛣️ Roadmap

* [ ] Streaming output support
* [ ] Cost ceiling + auto-fallbacks
* [ ] Rate limiter
* [ ] Multi-turn conversation API
* [ ] Local model support (llama.cpp, Ollama)
* [ ] VSCode extension for code-gen
* [ ] Custom provider registration
* [ ] Advanced caching strategies

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome! Please open an issue or submit a pull request.

---

## 📄 License

MIT © 2025 `npm-ai-hooks` Team

---

## 🔗 Links

- [GitHub Repository](https://github.com/iTeebot/npm-ai-hooks)
- [NPM Package](https://www.npmjs.com/package/npm-ai-hooks)
- [Documentation](https://labs.iteebot.com/npm-packages/npm-ai-hooks)
- [Changelog](CHANGELOG.md)
