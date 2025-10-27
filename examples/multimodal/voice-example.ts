import { initAIHooks, wrap } from 'npm-ai-hooks';

// Initialize with your API key
initAIHooks({
  providers: [
    {
      provider: 'openai',
      key: process.env.OPENAI_KEY || 'your-openai-key'
    }
  ]
});

/**
 * Voice Input with npm-ai-hooks
 * 
 * Note: Voice recording is primarily designed for browser environments
 * using the Web Speech API. For Node.js, you would need additional
 * libraries like 'node-record-lpcm16' or 'sox-audio' for recording,
 * and a speech-to-text service.
 * 
 * This example shows how to use transcribed text with the library.
 */

// Example 1: Process transcribed voice input
async function processVoiceInput(transcribedText: string) {
  const explainFn = wrap((text: string) => text, {
    provider: 'openai',
    model: 'gpt-4o',
    task: 'explain'
  });

  const result = await explainFn(transcribedText);
  console.log('Explanation:', result.output);
}

// Example 2: Voice-to-voice (text-to-speech not included)
async function voiceConversation(transcribedText: string) {
  const converseFn = wrap((text: string) => text, {
    provider: 'openai',
    model: 'gpt-4o',
    customPrompt: 'You are a helpful voice assistant. Respond in a natural, conversational way.'
  });

  const result = await converseFn(transcribedText);
  console.log('Response:', result.output);
  
  // Note: To convert this to speech, you would use a TTS library
  // like 'say.js', 'google-tts-api', or OpenAI's TTS endpoint
  return result.output;
}

// Example 3: Voice command processing
async function processVoiceCommand(command: string) {
  const commandFn = wrap((cmd: string) => cmd, {
    provider: 'openai',
    model: 'gpt-4o',
    customPrompt: `You are a voice command processor. Given a voice command, 
    identify the intent and extract relevant parameters. 
    Respond in JSON format with: { intent, parameters, confirmation }.`
  });

  const result = await commandFn(command);
  console.log('Command Analysis:', result.output);
  
  try {
    const parsed = JSON.parse(result.output);
    return parsed;
  } catch {
    return { error: 'Could not parse command', raw: result.output };
  }
}

// Example 4: Multi-language voice support
async function translateVoiceInput(transcribedText: string, targetLanguage: string = 'Spanish') {
  const translateFn = wrap((text: string) => text, {
    provider: 'openai',
    model: 'gpt-4o',
    task: 'translate',
    targetLanguage
  });

  const result = await translateFn(transcribedText);
  console.log(`Translated to ${targetLanguage}:`, result.output);
}

// Example 5: Voice-based code review
async function voiceCodeReview(spokenCodeDescription: string) {
  const reviewFn = wrap((text: string) => text, {
    provider: 'openai',
    model: 'gpt-4o',
    customPrompt: `The user is describing code verbally. 
    Based on their description, provide code review insights and suggestions.`
  });

  const result = await reviewFn(spokenCodeDescription);
  console.log('Code Review from Voice:', result.output);
}

// Browser-specific: Web Speech API integration
export const browserVoiceRecording = `
// This code works in browsers that support the Web Speech API

class VoiceRecorder {
  private recognition: any;
  private isRecording = false;

  constructor() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    } else {
      throw new Error('Speech recognition not supported in this browser');
    }
  }

  async startRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error('Speech recognition error: ' + event.error));
      };

      this.recognition.start();
      this.isRecording = true;
    });
  }

  stopRecording() {
    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }
}

// Usage in browser:
async function browserExample() {
  import { wrap, initAIHooks } from 'npm-ai-hooks';
  
  initAIHooks({
    providers: [
      { provider: 'openai', key: 'your-api-key' }
    ]
  });

  const recorder = new VoiceRecorder();
  
  try {
    console.log('Listening...');
    const transcript = await recorder.startRecording();
    console.log('You said:', transcript);
    
    // Process with AI
    const explainFn = wrap((text: string) => text, {
      provider: 'openai',
      model: 'gpt-4o',
      task: 'explain'
    });
    
    const result = await explainFn(transcript);
    console.log('AI Response:', result.output);
  } catch (error) {
    console.error('Error:', error);
  }
}
`;

// Run examples with sample transcribed text
async function main() {
  try {
    console.log('=== Voice Input Processing Examples ===\n');

    console.log('1. Explaining transcribed voice input:');
    await processVoiceInput('What is the difference between let and const in JavaScript?');

    console.log('\n2. Voice conversation:');
    await voiceConversation('Tell me a quick tip about TypeScript');

    console.log('\n3. Voice command processing:');
    await processVoiceCommand('Set a reminder for tomorrow at 3 PM to call John');

    console.log('\n4. Multi-language translation:');
    await translateVoiceInput('Hello, how are you today?', 'French');

    console.log('\n5. Voice-based code review:');
    await voiceCodeReview('I have a function that loops through an array and pushes items to another array inside the loop');

    console.log('\n=== Browser Integration ===');
    console.log('For browser-based voice recording, see the browserVoiceRecording export');
    console.log('or check the React example in examples/react/');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();

export {
  processVoiceInput,
  voiceConversation,
  processVoiceCommand,
  translateVoiceInput,
  voiceCodeReview
};

