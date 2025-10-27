# Multimodal Examples for npm-ai-hooks

This directory contains examples demonstrating the multimodal capabilities of `npm-ai-hooks`, including image analysis, file processing, and voice input.

## 📁 Examples

### 🖼️ Vision Example (`vision-example.ts`)
Demonstrates how to use AI models with image inputs.

**Features:**
- Image analysis and description
- OCR (text extraction from images)
- Code review from screenshots
- Document analysis
- Image comparison

**Usage:**
```typescript
import { analyzeImage } from './vision-example';

// Analyze an image
await analyzeImage('./my-image.jpg');
```

### 🎤 Voice Example (`voice-example.ts`)
Shows integration with voice input and speech recognition.

**Features:**
- Voice input processing
- Voice-to-text conversion
- Voice commands
- Multi-language voice translation
- Voice-based code review

**Usage:**
```typescript
import { processVoiceInput } from './voice-example';

// Process transcribed voice input
await processVoiceInput('What is machine learning?');
```

## 🚀 Getting Started

### Prerequisites
```bash
npm install npm-ai-hooks
```

### Setup
1. Set your API keys in environment variables or pass them directly:
```bash
export OPENAI_KEY="your-openai-key"
# or
export CLAUDE_KEY="your-claude-key"
```

2. Run the examples:
```bash
# Using ts-node
npx ts-node vision-example.ts

# Or compile and run
tsc vision-example.ts
node vision-example.js
```

## 📝 API Reference

### MultimodalInput Interface
```typescript
interface MultimodalInput {
  text?: string;           // Text content
  image?: string;          // Base64 encoded image with data URI
  file?: {                 // File attachment
    name: string;          // File name
    data: string;          // Base64 encoded file with data URI
    type: string;          // MIME type
  };
}
```

### Usage with wrap()
```typescript
import { wrap, MultimodalInput } from 'npm-ai-hooks';

const analyzeFn = wrap((input: MultimodalInput) => input, {
  provider: 'openai',
  model: 'gpt-4o',
  customPrompt: 'Analyze this input'
});

// With image
await analyzeFn({
  text: 'What is in this image?',
  image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
});

// With file
await analyzeFn({
  text: 'Summarize this document',
  file: {
    name: 'report.pdf',
    data: 'data:application/pdf;base64,JVBERi0xLj...',
    type: 'application/pdf'
  }
});
```

## 🎯 Use Cases

### Image Analysis
Perfect for:
- Product image descriptions
- Medical image analysis (with appropriate models)
- Quality control and inspection
- Accessibility (image alt text generation)
- Content moderation

### OCR & Document Processing
Ideal for:
- Invoice processing
- Receipt scanning
- Business card extraction
- Form data extraction
- Document digitization

### Code Screenshots
Great for:
- Code review from screenshots
- Bug reporting with visual context
- Documentation from screen captures
- Teaching and tutorials

### Voice Integration
Useful for:
- Voice assistants
- Accessibility features
- Hands-free operation
- Multi-language support
- Voice commands

## 🔧 Supported Providers

### Vision Models
| Provider | Model | Image Support | Notes |
|----------|-------|---------------|-------|
| OpenAI | gpt-4o | ✅ | Best for general vision |
| OpenAI | gpt-4-turbo | ✅ | High quality vision |
| Claude | claude-3-opus | ✅ | Excellent for detailed analysis |
| Claude | claude-3-sonnet | ✅ | Good balance of speed/quality |
| Claude | claude-3-haiku | ✅ | Fast, cost-effective |
| Gemini | gemini-pro-vision | ✅ | Google's vision model |

### File Format Support
- **Images**: JPG, PNG, GIF, WebP, BMP
- **Documents**: PDF, TXT, DOCX (as text)
- **Code**: Any text-based code file
- **Data**: JSON, XML, CSV

## 💡 Best Practices

### Image Handling
1. **Size**: Keep images under 20MB
2. **Format**: Use JPG for photos, PNG for screenshots
3. **Resolution**: Higher resolution for text/OCR, lower for general analysis
4. **Encoding**: Always use base64 with proper data URI

```typescript
// Good
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

// Bad (missing data URI prefix)
const base64Image = imageBuffer.toString('base64');
```

### Voice Input
1. **Environment**: Quiet environment for better accuracy
2. **Language**: Set correct language for recognition
3. **Length**: Keep voice inputs under 30 seconds for best results
4. **Fallback**: Always provide text fallback option

### Error Handling
```typescript
try {
  const result = await analyzeFn({
    text: 'Analyze this',
    image: base64Image
  });
  console.log(result.output);
} catch (error) {
  if (error.message.includes('invalid image')) {
    console.error('Image format not supported');
  } else if (error.message.includes('too large')) {
    console.error('Image file too large');
  } else {
    console.error('Error:', error);
  }
}
```

## 🌐 Browser vs Node.js

### Browser
- ✅ Native Web Speech API
- ✅ File uploads via `<input type="file">`
- ✅ Drag and drop support
- ✅ Canvas for image manipulation
- ✅ MediaRecorder for audio

### Node.js
- ✅ File system access
- ✅ Batch processing
- ✅ Server-side processing
- ⚠️ Requires additional libraries for recording
- ⚠️ No native speech recognition

## 📚 Additional Resources

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/vision)
- [Claude Vision Capabilities](https://docs.anthropic.com/claude/docs/vision)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Base64 Encoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64)

## 🤝 Contributing

Found an issue or have an enhancement? Please open an issue on GitHub!

## 📄 License

Same as the main npm-ai-hooks package.

