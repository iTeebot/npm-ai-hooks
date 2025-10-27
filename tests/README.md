# Test Suite Documentation

This directory contains comprehensive tests for the npm-ai-hooks library, designed for production-grade quality with 500+ weekly users.

## Test Structure

### Core Test Files

- **`setup.ts`** - Test configuration and utilities
- **`providers.test.ts`** - Provider-specific tests (OpenAI, Claude, Gemini, etc.)
- **`tasks.test.ts`** - Task-specific tests (summarize, translate, explain, etc.)
- **`error-handling.test.ts`** - Error scenarios and edge cases
- **`integration.test.ts`** - End-to-end workflows and provider switching
- **`performance.test.ts`** - Performance and load testing

## Test Categories

### 1. Provider Tests (`providers.test.ts`)
- Provider detection and selection
- API key validation (both valid and invalid)
- Provider-specific API calls
- Error handling for each provider
- Fallback mechanisms

### 2. Task Tests (`tasks.test.ts`)
- All supported tasks: summarize, translate, explain, rewrite, sentiment, codeReview
- Different input types and sizes
- Task-specific configurations
- Provider-task combinations

### 3. Error Handling Tests (`error-handling.test.ts`)
- API key errors (invalid, expired, unauthorized)
- Rate limiting and quota exceeded
- Model errors (not found, not allowed)
- Network errors (timeout, connection refused)
- Server errors (500, 502, 503)
- Malformed responses
- Input validation edge cases

### 4. Integration Tests (`integration.test.ts`)
- Provider fallback chains
- Multi-provider workflows
- Concurrent operations
- Provider availability detection
- Model selection
- Caching integration
- Error recovery

### 5. Performance Tests (`performance.test.ts`)
- Response time benchmarks
- Memory usage monitoring
- Throughput testing
- Provider performance comparison
- Task performance comparison
- Error recovery performance

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:providers      # Provider tests only
npm run test:tasks          # Task tests only
npm run test:errors         # Error handling tests only
npm run test:integration    # Integration tests only
npm run test:performance    # Performance tests only
```

### Development
```bash
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
```

### CI/CD
```bash
npm run test:ci             # CI-optimized test run
```

## Test Configuration

### Environment Variables
Tests use mock API keys by default. For integration testing with real APIs, set:

```env
OPENAI_KEY=sk-real-key
CLAUDE_KEY=sk-real-key
# ... other provider keys
```

### Test Data
Test inputs are defined in `setup.ts`:
- `TEST_INPUTS.short` - Short text
- `TEST_INPUTS.medium` - Medium text
- `TEST_INPUTS.long` - Long text
- `TEST_INPUTS.code` - Code snippet
- `TEST_INPUTS.html` - HTML content
- `TEST_INPUTS.json` - JSON data

### Mocking
- `fetch` is mocked globally for all tests
- Console output is suppressed unless `TEST_VERBOSE=true`
- API responses are mocked with realistic data

## Test Coverage

The test suite aims for:
- **100% provider coverage** - All 9 supported providers
- **100% task coverage** - All 6 supported tasks
- **Comprehensive error scenarios** - 20+ error types
- **Performance benchmarks** - Response time, memory, throughput
- **Integration workflows** - Real-world usage patterns

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Multiple Node.js versions (18, 20, 21)
- Security scanning
- Coverage reporting
- Automatic npm publishing (on main branch)

## Production Readiness

This test suite ensures:
- **Reliability** - Handles all error scenarios gracefully
- **Performance** - Meets response time requirements
- **Scalability** - Handles concurrent requests efficiently
- **Security** - Validates API key handling
- **Compatibility** - Works across Node.js versions
- **Maintainability** - Clear test structure and documentation

## Adding New Tests

When adding new features:
1. Add provider tests in `providers.test.ts`
2. Add task tests in `tasks.test.ts`
3. Add error scenarios in `error-handling.test.ts`
4. Add integration tests in `integration.test.ts`
5. Add performance tests in `performance.test.ts`
6. Update this documentation

## Debugging Tests

Enable verbose output:
```bash
TEST_VERBOSE=true npm test
```

Enable debug logging:
```bash
DEBUG=true npm test
```
