# API Key Validation

## Overview

The library now includes utilities to validate API keys before making requests, helping you catch configuration errors early.

---

## Features

### 1. Quick Format Validation (No API Call)

Validates that an API key matches the expected format for a provider:

```typescript
import { quickValidateKeyFormat } from 'npm-ai-hooks';

const result = quickValidateKeyFormat('openai', 'sk-...');
console.log(result);
// {
//   valid: true,
//   provider: 'openai',
//   message: 'API key format looks valid'
// }
```

### 2. Full API Key Validation (Makes Test Request)

Actually tests the API key by making a minimal request:

```typescript
import { validateApiKey } from 'npm-ai-hooks';

const result = await validateApiKey('openai', 'sk-...');
console.log(result);
// {
//   valid: true,
//   provider: 'openai',
//   message: 'API key is valid'
// }
```

### 3. Batch Validation

Validate multiple keys at once:

```typescript
import { validateApiKeys } from 'npm-ai-hooks';

const results = await validateApiKeys({
  openai: 'sk-...',
  groq: 'gsk_...',
  claude: 'sk-ant-...'
});

console.log(results);
// {
//   openai: { valid: true, provider: 'openai', message: '...' },
//   groq: { valid: true, provider: 'groq', message: '...' },
//   claude: { valid: false, provider: 'claude', error: 'INVALID_KEY', message: '...' }
// }
```

---

## API Reference

### `quickValidateKeyFormat(provider, apiKey)`

**Quick format check (no API call)**

```typescript
function quickValidateKeyFormat(
  provider: Provider,
  apiKey: string
): KeyValidationResult
```

**Parameters:**
- `provider`: Provider name ('openai', 'claude', etc.)
- `apiKey`: API key to validate

**Returns:** `KeyValidationResult`
```typescript
interface KeyValidationResult {
  valid: boolean;
  provider: Provider;
  error?: string;
  message: string;
}
```

**Example:**
```typescript
const result = quickValidateKeyFormat('groq', 'gsk_abc123...');
if (!result.valid) {
  console.error(result.message);
}
```

---

### `validateApiKey(provider, apiKey)`

**Full validation (makes test API request)**

```typescript
async function validateApiKey(
  provider: Provider,
  apiKey: string
): Promise<KeyValidationResult>
```

**Parameters:**
- `provider`: Provider name
- `apiKey`: API key to validate

**Returns:** Promise of `KeyValidationResult`

**Example:**
```typescript
try {
  const result = await validateApiKey('openai', userApiKey);
  if (result.valid) {
    console.log('✓ Key is valid!');
  } else {
    console.error('✗ Invalid:', result.message);
  }
} catch (error) {
  console.error('Validation failed:', error);
}
```

---

### `validateApiKeys(keys)`

**Batch validation**

```typescript
async function validateApiKeys(
  keys: Record<Provider, string>
): Promise<Record<Provider, KeyValidationResult>>
```

**Parameters:**
- `keys`: Object mapping providers to API keys

**Returns:** Promise of validation results

**Example:**
```typescript
const keys = {
  openai: process.env.OPENAI_KEY!,
  groq: process.env.GROQ_KEY!
};

const results = await validateApiKeys(keys);

for (const [provider, result] of Object.entries(results)) {
  console.log(`${provider}: ${result.valid ? '✓' : '✗'} ${result.message}`);
}
```

---

## Error Types

### Format Validation Errors

- `EMPTY_KEY` - API key is empty
- `INVALID_FORMAT` - Key doesn't match expected pattern

### API Validation Errors

- `INVALID_KEY` - API key is invalid or unauthorized (401)
- `FORBIDDEN` - Key doesn't have access (403)
- `UNKNOWN_PROVIDER` - Provider not recognized

---

## Expected Key Formats

Each provider has a specific key format:

| Provider | Format Pattern | Example |
|----------|---------------|---------|
| OpenAI | `sk-[A-Za-z0-9-_]{20,}` | `sk-proj-abc123...` |
| Claude | `sk-ant-[A-Za-z0-9-_]{20,}` | `sk-ant-api03-...` |
| Gemini | `AIza[A-Za-z0-9-_]{35}` | `AIzaSyBs...` |
| Groq | `gsk_[A-Za-z0-9]{52}` | `gsk_abc123...` |
| DeepSeek | `sk-[A-Za-z0-9]{32}` | `sk-a1b2c3...` |
| xAI | `xai-[A-Za-z0-9-_]{40,}` | `xai-abc123...` |
| Mistral | `[A-Za-z0-9]{32}` | `abc123def456...` |
| Perplexity | `pplx-[A-Za-z0-9]{40}` | `pplx-abc123...` |
| OpenRouter | `sk-or-v1-[A-Za-z0-9]{64}` | `sk-or-v1-...` |

---

## Usage in React Example

The React example now validates keys when you click "Apply Configuration":

```typescript
const handleApplyConfig = () => {
  // ... get configured keys ...
  
  // Validate formats
  const invalidKeys: string[] = []
  for (const [key, value] of configuredKeys) {
    const validation = quickValidateKeyFormat(key, value)
    if (!validation.valid) {
      invalidKeys.push(`${provider}: ${validation.message}`)
    }
  }
  
  if (invalidKeys.length > 0) {
    alert('Warning: Invalid key formats:\n' + invalidKeys.join('\n'))
  }
  
  // Initialize...
}
```

---

## Best Practices

### 1. Validate on Input
```typescript
const handleKeyInput = (provider: Provider, key: string) => {
  const result = quickValidateKeyFormat(provider, key);
  setKeyError(result.valid ? null : result.message);
};
```

### 2. Validate Before Init
```typescript
const keys = getUserApiKeys();
const results = await validateApiKeys(keys);

const validKeys = Object.entries(results)
  .filter(([_, result]) => result.valid)
  .reduce((acc, [provider, _]) => {
    acc[provider] = keys[provider];
    return acc;
  }, {});

initAIHooks({ providers: formatKeys(validKeys) });
```

### 3. Show User Feedback
```typescript
const result = await validateApiKey('openai', userKey);

if (result.valid) {
  showSuccess('✓ OpenAI key is valid');
} else {
  showError(`✗ ${result.message}`);
}
```

---

## Notes

- **Quick validation** only checks format (instant, no API call)
- **Full validation** makes a test request (slow, uses API quota)
- **Rate limits** are treated as valid keys
- **Network errors** don't mean invalid keys
- Only clear auth errors (401/403) mark keys as invalid

---

## Example: UI with Validation

```tsx
function ApiKeyInput({ provider }: { provider: Provider }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleBlur = async () => {
    // Quick format check
    const quickResult = quickValidateKeyFormat(provider, key);
    if (!quickResult.valid) {
      setError(quickResult.message);
      return;
    }

    // Optional: Full validation
    setValidating(true);
    const fullResult = await validateApiKey(provider, key);
    setValidating(false);

    if (!fullResult.valid) {
      setError(fullResult.message);
    } else {
      setError('');
    }
  };

  return (
    <div>
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onBlur={handleBlur}
        placeholder={`Enter ${provider} API key`}
      />
      {validating && <span>Validating...</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

**Result:** Catch API key errors before making requests and provide better user feedback! ✅

