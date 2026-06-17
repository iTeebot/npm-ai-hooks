/**
 * Demo showing the new initialization system with all API keys
 * Tests all available providers to verify they're working
 */

// Load environment variables from .env file for testing
// Note: If running locally, please run `npm install dotenv` and uncomment:
// import * as dotenv from "dotenv";
// dotenv.config();

// Set test environment to prevent process.exit on errors
process.env.NODE_ENV = "test";

import { initAIHooks, addProvider, getProvider, getAvailableProviders } from '../src/providers';
import { wrap } from '../src/wrap';

async function testAllProviders() {
  console.log('🚀 Testing All AI Providers\n');

  // Initialize with all available providers
  const providers: Array<{ provider: string; key: string; defaultModel: string }> = [];
  
  // Check for API keys in various environment variable formats
  if (process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || process.env.OPENAI_KEY) {
    providers.push({ 
      provider: 'openai', 
      key: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '',
      defaultModel: 'gpt-4o'
    });
  }
  
  if (process.env.CLAUDE_KEY || process.env.CLAUDE_API_KEY || process.env.CLAUDE_KEY) {
    providers.push({ 
      provider: 'claude', 
      key: process.env.CLAUDE_KEY || process.env.CLAUDE_API_KEY || process.env.CLAUDE_KEY || '',
      defaultModel: 'claude-3-5-sonnet-20241022'
    });
  }
  
  if (process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_KEY) {
    providers.push({ 
      provider: 'gemini', 
      key: process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || '',
      defaultModel: 'gemini-1.5-flash'
    });
  }
  
  if (process.env.GROQ_KEY || process.env.GROQ_API_KEY || process.env.GROQ_KEY) {
    providers.push({ 
      provider: 'groq', 
      key: process.env.GROQ_KEY || process.env.GROQ_API_KEY || process.env.GROQ_KEY || '',
      defaultModel: 'llama-3.1-70b-versatile'
    });
  }
  
  if (process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY) {
    providers.push({ 
      provider: 'openrouter', 
      key: process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || '',
      defaultModel: 'openai/gpt-4o-mini'
    });
  }
  
  if (process.env.DEEPSEEK_KEY || process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY) {
    providers.push({ 
      provider: 'deepseek', 
      key: process.env.DEEPSEEK_KEY || process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY || '',
      defaultModel: 'deepseek-chat'
    });
  }
  
  if (process.env.XAI_KEY || process.env.XAI_API_KEY || process.env.XAI_KEY) {
    providers.push({ 
      provider: 'xai', 
      key: process.env.XAI_KEY || process.env.XAI_API_KEY || process.env.XAI_KEY || '',
      defaultModel: 'grok-2-1212'
    });
  }
  
  if (process.env.PERPLEXITY_KEY || process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_KEY) {
    providers.push({ 
      provider: 'perplexity', 
      key: process.env.PERPLEXITY_KEY || process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_KEY || '',
      defaultModel: 'sonar'
    });
  }
  
  if (process.env.MISTRAL_KEY || process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY) {
    providers.push({ 
      provider: 'mistral', 
      key: process.env.MISTRAL_KEY || process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY || '',
      defaultModel: 'mistral-large-latest'
    });
  }

  // Debug: Show what environment variables are available
  console.log('🔍 Debug: Checking environment variables...');
  const envVars = Object.keys(process.env).filter(key => 
    key.includes('API_KEY') || key.includes('AI_HOOK') || key.includes('OPENAI') || key.includes('CLAUDE') || key.includes('GROQ')
  );
  console.log('Found environment variables:', envVars);
  
  if (providers.length === 0) {
    console.log('❌ No API keys found in environment variables');
    console.log('Please set up your .env file with API keys');
    console.log('Expected variables: OPENAI_KEY, CLAUDE_KEY, etc.');
    return;
  }

  console.log(`✅ Found ${providers.length} providers with API keys:`);
  providers.forEach(p => console.log(`   - ${p.provider}`));
  console.log('');

  // Initialize with all providers
  initAIHooks({
    providers: providers as any, // Type assertion for compatibility
    defaultProvider: 'groq' as any // Prefer Groq if available
  });

  console.log('Available providers:', getAvailableProviders());
  console.log('');

  // Test default provider first
  console.log('🎯 Testing Default Provider Behavior...');
  const testText = "Hello! Please respond with just 'API working' to confirm this provider is functioning correctly.";
  
  try {
    const summarize = wrap((text: string) => text, { 
      task: "summarize"
      // No provider specified - should use default (groq)
    });
    
    const result = await summarize(testText);
    console.log(`   ✅ Default provider (groq): ${result.output.substring(0, 100)}...`);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('Invalid') || errorMsg.includes('API key')) {
      console.log(`   ❌ Default provider (groq): Invalid API key`);
    } else if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
      console.log(`   ⚠️  Default provider (groq): Rate limit/quota exceeded`);
    } else {
      console.log(`   ❌ Default provider (groq): ${errorMsg.substring(0, 100)}...`);
    }
  }

  console.log('\n🧪 Testing Each Provider Individually...');
  
  // Test each provider individually
  for (const providerConfig of providers) {
    const providerName = providerConfig.provider;
    console.log(`🧪 Testing ${providerName.toUpperCase()}...`);
    
    try {
      const summarize = wrap((text: string) => text, { 
        task: "summarize", 
        provider: providerName as any
      });
      
      const result = await summarize(testText);
      console.log(`   ✅ ${providerName}: ${result.output.substring(0, 100)}...`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('Invalid') || errorMsg.includes('API key')) {
        console.log(`   ❌ ${providerName}: Invalid API key`);
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
        console.log(`   ⚠️  ${providerName}: Rate limit/quota exceeded`);
      } else {
        console.log(`   ❌ ${providerName}: ${errorMsg.substring(0, 100)}...`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Testing Provider Selection Logic...');
  
  // Test provider selection
  const { provider: selectedProvider } = getProvider();
  console.log(`Selected default provider: ${selectedProvider}`);
  
  // Test specific provider selection
  if (providers.length > 1) {
    const secondProvider = providers[1].provider;
    const { provider: specificProvider } = getProvider(secondProvider as any);
    console.log(`Selected specific provider (${secondProvider}): ${specificProvider}`);
  }

  console.log('\n🔄 Testing Dynamic Provider Management...');
  
  // Test adding a provider dynamically (if we have a key for it)
  if (process.env.MISTRAL_KEY && !providers.some(p => p.provider === 'mistral')) {
    addProvider({
      provider: 'mistral',
      key: process.env.MISTRAL_KEY,
      defaultModel: 'mistral-large-latest'
    });
    console.log('Added Mistral provider dynamically');
  }

  console.log('Final available providers:', getAvailableProviders());

  console.log('\n✅ Demo completed! All working providers have been tested.');
}

// Run the demo
testAllProviders().catch(console.error);