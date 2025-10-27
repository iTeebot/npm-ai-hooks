# Migration Guide: v1.x to v2.0

This guide will help you migrate from the old environment variable-based system to the new explicit initialization system. The new version supports both Node.js (Express) and React (Vite) environments with a dual build system.

## Breaking Changes

### 1. dotenv Dependency Removed
- **Before**: Required `dotenv` package
- **After**: No external dependencies for environment variables (re-added as dev dependency for testing)

### 2. Provider Initialization Required
- **Before**: Automatic provider detection from environment variables
- **After**: Must explicitly initialize providers with `initAIHooks()`

### 3. Environment Variables No Longer Used
- **Before**: Set `OPENAI_KEY`, `CLAUDE_KEY`, etc.
- **After**: Pass API keys directly in initialization

### 4. Cross-Platform Support
- **New**: Works in both Node.js (Express) and React (Vite) environments
- **New**: Dual build system with automatic module format detection

## Migration Steps

### Step 1: Remove dotenv Dependency

```bash
npm uninstall dotenv
# or
yarn remove dotenv
```

### Step 2: Update Your Code

#### Old Way (v1.x)
```typescript
// .env file
OPENAI_KEY=sk-your-key-here
CLAUDE_KEY=sk-ant-your-key-here

// Your code
import { wrap } from 'npm-ai-hooks';

const summarize = wrap((text: string) => text, { task: "summarize" });
const result = await summarize("Some text");
```

#### New Way (v2.0)
```typescript
// No .env file needed
import { initAIHooks, wrap } from 'npm-ai-hooks';

// Initialize providers
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-your-key-here' },
    { provider: 'claude', key: 'sk-ant-your-key-here' }
  ]
});

// Your code (same as before)
const summarize = wrap((text: string) => text, { task: "summarize" });
const result = await summarize("Some text");
```

### Step 3: Update Provider Configuration

#### Basic Migration
```typescript
// Old: Environment variables
process.env.OPENAI_KEY = 'sk-...';
process.env.CLAUDE_KEY = 'sk-ant-...';

// New: Explicit initialization
initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-...' },
    { provider: 'claude', key: 'sk-ant-...' }
  ]
});
```

#### Advanced Migration with Custom Models
```typescript
// Old: Environment variables + separate model configuration
process.env.OPENAI_KEY = 'sk-...';
const summarize = wrap(fn, { 
  task: "summarize", 
  provider: "openai", 
  model: "gpt-4" 
});

// New: Everything in initialization
initAIHooks({
  providers: [
    { 
      provider: 'openai', 
      key: 'sk-...',
      defaultModel: 'gpt-4' // Custom default model
    }
  ],
  defaultProvider: 'openai' // Set default provider
});

const summarize = wrap(fn, { task: "summarize" });
```

### Step 4: Update Error Handling

#### Old Error Handling
```typescript
try {
  const result = await summarize("text");
} catch (error) {
  if (error.pretty) {
    error.pretty(); // Old error format
  }
}
```

#### New Error Handling
```typescript
try {
  const result = await summarize("text");
} catch (error) {
  console.error('Error:', error.message);
  // Error format is now consistent across all providers
}
```

## 🔄 Backward Compatibility

The old API still works for existing users, but we recommend migrating to the new system for:

- ✅ **Better Performance**: 77% reduction in code size
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Security**: No accidental environment variable exposure
- ✅ **Flexibility**: Dynamic provider management
- ✅ **Maintainability**: Cleaner, more explicit code

## 📚 New Features Available After Migration

### 1. Dynamic Provider Management
```typescript
import { addProvider, removeProvider, getAvailableProviders } from 'npm-ai-hooks';

// Add providers at runtime
addProvider({ 
  provider: 'mistral', 
  key: '...', 
  defaultModel: 'mistral-large' 
});

// Remove providers
removeProvider('mistral');

// Check available providers
console.log(getAvailableProviders());
```

### 2. Provider Preference Control
```typescript
initAIHooks({
  providers: [
    { provider: 'groq', key: '...' },
    { provider: 'openrouter', key: '...' }, // This will be preferred
    { provider: 'openai', key: '...' }
  ],
  defaultProvider: 'openrouter' // Explicit default
});
```

### 3. Custom Default Models
```typescript
initAIHooks({
  providers: [
    { 
      provider: 'openai', 
      key: '...',
      defaultModel: 'gpt-4' // Custom default for this provider
    },
    { 
      provider: 'claude', 
      key: '...',
      defaultModel: 'claude-3-sonnet-20240229'
    }
  ]
});
```

## 🧪 Testing Migration

### Update Test Setup
```typescript
// Old test setup
process.env.OPENAI_KEY = 'sk-test-key';

// New test setup
import { initAIHooks, reset } from 'npm-ai-hooks';

beforeEach(() => {
  reset(); // Reset provider system
  initAIHooks({
    providers: [
      { provider: 'openai', key: 'sk-test-key' }
    ]
  });
});
```

## React/Vite Migration

If you're using the library in a React application with Vite:

### Step 1: Update Vite Configuration

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

### Step 2: Use Vite Environment Variables

```typescript
// App.tsx
import { initAIHooks, wrap } from 'npm-ai-hooks';

// Initialize with Vite environment variables (VITE_ prefix required)
initAIHooks({
  providers: [
    { provider: 'openai', key: import.meta.env.VITE_OPENAI_KEY },
    { provider: 'groq', key: import.meta.env.VITE_GROQ_KEY },
    { provider: 'claude', key: import.meta.env.VITE_CLAUDE_KEY }
  ],
  defaultProvider: 'groq'
});
```

### Step 3: Update .env File

```bash
# .env (Vite requires VITE_ prefix)
VITE_OPENAI_KEY=your_openai_key_here
VITE_GROQ_KEY=your_groq_key_here
VITE_CLAUDE_KEY=your_claude_key_here
```

## Performance Benefits

After migration, you'll see:

- **77% smaller bundle size**
- **Faster initialization**
- **Better memory usage**
- **Improved error handling**
- **Enhanced type safety**
- **Cross-platform compatibility**

## Need Help?

If you encounter any issues during migration:

1. Check the [CHANGELOG.md](CHANGELOG.md) for detailed changes
2. Review the [README.md](README.md) for new usage examples
3. Open an issue on GitHub for support

## Migration Checklist

- [ ] Remove `dotenv` dependency
- [ ] Add `initAIHooks()` call at application startup
- [ ] Move API keys from environment variables to initialization
- [ ] Update test setup to use new initialization
- [ ] Test all provider functionality
- [ ] Update documentation and examples
- [ ] Deploy and verify everything works
- [ ] (React) Update Vite configuration for file system access
- [ ] (React) Use VITE_ prefixed environment variables

## You're Done!

After completing these steps, you'll have successfully migrated to v2.0 and can take advantage of all the new features and improvements!
