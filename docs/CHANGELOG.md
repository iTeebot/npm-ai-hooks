# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-21

### Major Refactoring - Provider System Overhaul

This is a major release that completely refactors the provider system for better maintainability, performance, and developer experience. Now supports both Node.js (Express) and React (Vite) environments with a dual build system.

### Added

- **Cross-Platform Support**: Works in both Node.js (Express) and React (Vite) environments
  - Dual build system with ES modules for React and CommonJS for Node.js
  - Automatic module format detection
  - Browser-safe error handling (no process.exit in browser)

- **New Initialization System**: Explicit provider configuration without environment variables
  - `initAIHooks()` function for initializing providers with API keys
  - `addProvider()` and `removeProvider()` for dynamic provider management
  - Support for custom default models per provider
  - Type-safe provider configuration

- **Provider Configuration Interface**:
  ```typescript
  interface UserProviderConfig {
    provider: Provider;
    key: string;
    defaultModel?: string;
  }
  ```

- **Base Provider Architecture**:
  - `BaseProvider` class with common functionality
  - `ProviderRegistry` for dynamic provider management
  - `ProviderConfigs` for centralized configuration
  - Specialized providers for unique implementations

- **Enhanced Error Handling**:
  - Centralized error handling across all providers
  - Consistent error message formatting
  - Better error categorization and suggestions
  - Browser-safe error handling (no process.exit in React)

- **Dual Build System**:
  - ES modules for React/Vite environments
  - CommonJS for Node.js/Express environments
  - Automatic module format detection
  - TypeScript support for both formats

### Changed

- **Provider Initialization**: Now requires explicit initialization instead of environment variables
- **Code Reduction**: 77% reduction in provider code (882 lines → 200 lines)
- **Error Messages**: Standardized error message format across all providers
- **Provider Preference**: Maintains same fallback logic (OpenRouter → Default → First Available)
- **Module System**: Dual build system supports both ES modules and CommonJS

### Removed

- **dotenv Dependency**: No longer required or used (re-added as dev dependency for testing)
- **Environment Variable Dependencies**: All provider keys must be provided explicitly
- **Individual Provider Files**: Replaced with centralized base classes
- **Legacy Provider System**: Old environment-based system (still backward compatible)

### Fixed

- **Code Duplication**: Eliminated 80%+ code duplication across providers
- **Maintainability**: Single source of truth for common functionality
- **Type Safety**: Full TypeScript support throughout
- **Bundle Size**: Significantly reduced package size
- **Browser Compatibility**: Fixed require() calls and process.exit() issues for React
- **Module Resolution**: Fixed import/export issues for both environments

### Documentation

- **Updated README**: Complete rewrite with new initialization examples and React support
- **New Examples**: Comprehensive examples showing new usage patterns for both Node.js and React
- **Migration Guide**: Step-by-step migration from old to new system
- **API Documentation**: Complete API reference for new functions
- **React Guide**: Detailed React/Vite setup and usage instructions

### Testing

- **Updated Test Suite**: All tests updated for new initialization system
- **Better Test Coverage**: More comprehensive testing of provider functionality
- **Test Utilities**: Enhanced test helpers and utilities
- **Cross-Platform Testing**: Tests for both Node.js and React environments

## [1.0.3] - 2024-12-18

### Added
- Initial release with environment variable-based provider system
- Support for 9 AI providers (OpenAI, Claude, Gemini, Groq, DeepSeek, Mistral, xAI, Perplexity, OpenRouter)
- Task-based AI operations (summarize, translate, explain, rewrite, sentiment, code review)
- TypeScript support with full type definitions

### Features
- Universal AI hook layer for Node.js
- One wrapper for all AI providers
- No provider lock-in
- Automatic provider selection and fallback
- Comprehensive error handling

---

## Migration Guide

### From v1.x to v2.0

#### Old Way (v1.x)
```typescript
// Set environment variables
process.env.OPENAI_KEY = 'sk-...';

// Use providers
import { getProvider } from 'npm-ai-hooks';
const { fn } = getProvider();
```

#### New Way (v2.0)
```typescript
// Initialize providers explicitly
import { initAIHooks, getProvider } from 'npm-ai-hooks';

initAIHooks({
  providers: [
    { provider: 'openai', key: 'sk-...', defaultModel: 'gpt-4' }
  ],
  defaultProvider: 'openai'
});

// Use providers (same API)
const { fn } = getProvider();
```

### Benefits of Migration

1. **No Environment Dependencies**: Cleaner, more explicit configuration
2. **Better Security**: No accidental exposure of environment variables
3. **Type Safety**: Full TypeScript support for provider configuration
4. **Dynamic Management**: Add/remove providers at runtime
5. **Custom Models**: Specify default models per provider
6. **Smaller Bundle**: 77% reduction in code size

### Backward Compatibility

The old API still works for existing users, but new features require the new initialization system. We recommend migrating to the new system for better performance and features.

---

## Breaking Changes

- **dotenv dependency removed**: Must be removed from your project
- **Environment variables**: No longer automatically loaded
- **Provider initialization**: Must call `initAIHooks()` before using providers

## Deprecations

- Environment variable-based provider detection (still works but deprecated)
- Individual provider files (replaced with base classes)

## Security

- **API Key Security**: Keys are now passed explicitly, reducing risk of accidental exposure
- **No Environment Dependencies**: Eliminates potential security issues with environment variable handling

## Performance

- **77% Code Reduction**: Significantly smaller bundle size
- **Faster Loading**: Reduced initialization time
- **Memory Efficiency**: Shared code reduces memory usage
- **Better Caching**: Centralized provider management enables better caching strategies

## Developer Experience

- **Type Safety**: Full TypeScript support with IntelliSense
- **Better Error Messages**: Clear, actionable error messages
- **Easier Testing**: Mock providers more easily
- **Documentation**: Comprehensive examples and API docs
- **IDE Support**: Better autocomplete and type checking
