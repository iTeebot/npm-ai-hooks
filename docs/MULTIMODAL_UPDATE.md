# Multimodal Features Update - npm-ai-hooks

## 🎉 What's New

This update brings comprehensive multimodal support to npm-ai-hooks, enabling you to work with images, files, and voice inputs alongside text. The React example has been completely enhanced with a modern UI showcasing all these capabilities.

## ✨ New Features

### 1. **Multimodal Input Support** 🖼️📎

The library now supports the `MultimodalInput` interface for working with multiple types of data:

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

**Key capabilities:**
- ✅ Image analysis with vision-enabled models (GPT-4o, Claude 3, Gemini Pro Vision)
- ✅ OCR (text extraction from images)
- ✅ Document processing (PDFs, text files)
- ✅ Code review from screenshots
- ✅ Chart and diagram analysis
- ✅ File content analysis

### 2. **Enhanced React Example** ⚛️

The React example (`examples/react/`) now features:

#### **Syntax Highlighting for Code Blocks**
- Beautiful code rendering using `react-syntax-highlighter`
- Support for 180+ programming languages
- Dark and light theme support
- Proper GitHub Flavored Markdown support with `remark-gfm`

#### **Copy Functionality**
- Copy button on every code block (appears on hover)
- Copy entire assistant responses with one click
- Visual feedback with checkmark icons
- Seamless clipboard integration

#### **Image Upload & Preview**
- Click image icon to upload photos
- Preview images before sending
- Automatic base64 encoding
- Support for JPG, PNG, GIF, WebP, BMP

#### **File Attachments**
- Paperclip icon for attaching any file type
- File name and type display
- Works with PDFs, documents, code files
- Preview before sending

#### **Voice Input** 🎤
- Web Speech API integration (browser-native)
- Real-time recording with visual feedback
- Animated pulsing indicator while recording
- Automatic speech-to-text transcription
- Works in Chrome, Edge, Safari
- No external API calls needed

#### **UI/UX Improvements**
- Dark and light theme toggle
- Smooth animations and transitions
- Hover effects for interactive elements
- Attachment preview panel
- Better message bubbles
- Responsive design
- Clean, modern aesthetics

### 3. **New Examples & Documentation**

#### **Vision Examples** (`examples/multimodal/vision-example.ts`)
Demonstrates:
- Image analysis and description
- OCR and text extraction
- Code review from screenshots
- Document analysis
- Image comparison

#### **Voice Examples** (`examples/multimodal/voice-example.ts`)
Shows:
- Voice input processing
- Voice-to-text conversion
- Voice commands
- Multi-language voice translation
- Voice-based code review

#### **Comprehensive Documentation**
- `examples/react/FEATURES.md` - Detailed feature documentation
- `examples/multimodal/README.md` - Multimodal API guide
- Updated main `Readme.md` with multimodal examples
- Updated React example README

## 📦 New Dependencies (React Example)

```json
{
  "react-syntax-highlighter": "^16.0.0",
  "@types/react-syntax-highlighter": "^15.5.13",
  "remark-gfm": "^4.0.1",
  "rehype-highlight": "^7.0.2"
}
```

## 🔧 Library Changes

### Updated Files
- **`src/wrap.ts`** - Added `MultimodalInput` interface and multimodal handling
- **`src/index.ts`** - Exported `MultimodalInput` type
- **`Readme.md`** - Added multimodal features section and updated feature list

### New Files
- `examples/multimodal/vision-example.ts` - Vision API examples
- `examples/multimodal/voice-example.ts` - Voice input examples
- `examples/multimodal/README.md` - Multimodal documentation
- `examples/react/FEATURES.md` - React example feature guide
- `MULTIMODAL_UPDATE.md` - This file

## 🚀 Usage Examples

### Basic Image Analysis

```typescript
import { wrap, MultimodalInput } from 'npm-ai-hooks';
import * as fs from 'fs';

const analyzeImage = wrap((input: MultimodalInput) => input, {
  provider: 'openai',
  model: 'gpt-4o',
  customPrompt: 'Describe this image'
});

const imageBuffer = fs.readFileSync('./photo.jpg');
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

const result = await analyzeImage({
  text: 'What is in this image?',
  image: base64Image
});
```

### Voice Input (Browser)

```typescript
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  
  const explain = wrap((text: string) => text, { task: 'explain' });
  const result = await explain(transcript);
  console.log(result.output);
};

recognition.start();
```

### File Processing

```typescript
const analyzeFile = wrap((input: MultimodalInput) => input, {
  provider: 'claude',
  model: 'claude-3-opus',
  task: 'summarize'
});

const fileBuffer = fs.readFileSync('./document.pdf');
const result = await analyzeFile({
  text: 'Summarize this document',
  file: {
    name: 'document.pdf',
    data: `data:application/pdf;base64,${fileBuffer.toString('base64')}`,
    type: 'application/pdf'
  }
});
```

## 🎨 React Example Enhanced UI

The React example now includes:

### Input Area Features
- Textarea with attachment buttons overlay
- Image upload button (📷)
- File attachment button (📎)
- Voice recording button (🎤)
- Attachment preview panel
- Real-time recording indicator

### Message Display
- Markdown rendering with syntax highlighting
- Code block copy buttons
- Message copy buttons (appear on hover)
- Image previews in messages
- File attachment indicators
- User/assistant message distinction
- Proper spacing and styling

### Theme Support
- Dark mode (default)
- Light mode
- Theme toggle in header
- Consistent styling across themes
- Code highlighting matches theme

## 📝 Best Practices

### Image Handling
```typescript
// ✅ Good - Include data URI prefix
const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

// ❌ Bad - Missing data URI
const base64Image = buffer.toString('base64');
```

### Voice Recording
- Use quiet environment for best accuracy
- Set correct language for recognition
- Keep recordings under 30 seconds
- Provide text fallback option

### Error Handling
```typescript
try {
  const result = await analyzeImage({ text, image });
} catch (error) {
  if (error.message.includes('invalid image')) {
    // Handle invalid image format
  } else if (error.message.includes('too large')) {
    // Handle file size limit
  }
}
```

## 🔐 Security Notes

- Image/file data is base64 encoded client-side
- No data sent to npm-ai-hooks servers
- API calls go directly to your chosen provider
- Browser APIs (Speech Recognition, File Upload) require user permission
- Store API keys securely, never in client code for production

## 🌐 Browser Support

### Voice Input
- ✅ Chrome (best support)
- ✅ Edge (Chromium)
- ✅ Safari
- ⚠️ Firefox (limited support)

### File Upload & Image Processing
- ✅ All modern browsers
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 💡 Use Cases

### Vision/Image
- Product image descriptions for e-commerce
- Medical image analysis (with appropriate models)
- Quality control and inspection
- Accessibility (alt text generation)
- Content moderation
- OCR for receipts, invoices, documents

### Voice
- Voice assistants and chatbots
- Accessibility features
- Hands-free operation
- Multi-language support
- Voice commands for applications

### Files
- Document summarization
- Code review and analysis
- Data extraction from PDFs
- Report generation
- Content analysis

## 🔮 Future Enhancements

Potential additions in future updates:
- Audio file upload (not just live recording)
- Video frame analysis
- Batch image processing
- PDF text extraction client-side
- Multiple image comparison in single request
- Streaming responses for multimodal inputs
- Progress indicators for large files

## 🤝 Contributing

This is a major feature update! If you encounter issues or have suggestions:
1. Check the documentation in `examples/multimodal/README.md`
2. Review examples in `examples/multimodal/`
3. Try the React example in `examples/react/`
4. Open an issue on GitHub with details

## 📄 Migration Guide

### For Existing Users

No breaking changes! Your existing code continues to work. To use new features:

1. **Update the library:**
   ```bash
   npm update npm-ai-hooks
   ```

2. **Import new types (optional):**
   ```typescript
   import { wrap, MultimodalInput } from 'npm-ai-hooks';
   ```

3. **Use multimodal inputs:**
   ```typescript
   // Old way (still works)
   const fn = wrap((text: string) => text, { task: 'summarize' });
   
   // New way (with images)
   const fn = wrap((input: MultimodalInput) => input, { 
     provider: 'openai',
     model: 'gpt-4o',
     task: 'summarize' 
   });
   ```

## 📊 Stats

**Files Changed:** 8
**Files Added:** 5
**Lines Added:** ~1500
**New Features:** 10+
**Documentation Pages:** 4

## 🙏 Acknowledgments

- Built on top of excellent libraries:
  - `react-syntax-highlighter` for code highlighting
  - `react-markdown` for markdown rendering
  - `remark-gfm` for GitHub Flavored Markdown
  - `lucide-react` for beautiful icons
  - Web Speech API for voice recognition

---

**Version:** 1.1.0 (Multimodal Update)
**Date:** October 2025
**Status:** ✅ Complete and Ready to Use

