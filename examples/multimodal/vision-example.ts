import { initAIHooks, wrap, type MultimodalInput } from 'npm-ai-hooks';
import * as fs from 'fs';
import * as path from 'path';

// Initialize with your API key
initAIHooks({
  providers: [
    {
      provider: 'openai',
      key: process.env.OPENAI_KEY || 'your-openai-key'
    }
  ]
});

// Example 1: Image Analysis
async function analyzeImage(imagePath: string) {
  // Read image and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  // Create a multimodal input function
  const analyzeImageFn = wrap((input: MultimodalInput) => input, {
    provider: 'openai',
    model: 'gpt-4o', // GPT-4 with vision
    customPrompt: 'Describe what you see in this image in detail.'
  });

  const result = await analyzeImageFn({
    text: 'Please analyze this image',
    image: base64Image
  });

  console.log('Image Analysis:', result.output);
}

// Example 2: OCR (Text Extraction from Image)
async function extractTextFromImage(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const ocrFn = wrap((input: MultimodalInput) => input, {
    provider: 'openai',
    model: 'gpt-4o',
    customPrompt: 'Extract all text from this image. Return only the text content.'
  });

  const result = await ocrFn({
    text: 'Extract text from this document',
    image: base64Image
  });

  console.log('Extracted Text:', result.output);
}

// Example 3: Image + Code Review
async function reviewCodeScreenshot(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  const reviewFn = wrap((input: MultimodalInput) => input, {
    provider: 'openai',
    model: 'gpt-4o',
    task: 'codeReview'
  });

  const result = await reviewFn({
    text: 'Review the code in this screenshot',
    image: base64Image
  });

  console.log('Code Review:', result.output);
}

// Example 4: File Content Analysis
async function analyzeDocument(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64File = fileBuffer.toString('base64');
  const fileName = path.basename(filePath);
  const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain';

  const analyzeFn = wrap((input: MultimodalInput) => input, {
    provider: 'openai',
    model: 'gpt-4o',
    task: 'summarize'
  });

  const result = await analyzeFn({
    text: 'Summarize this document',
    file: {
      name: fileName,
      data: `data:${mimeType};base64,${base64File}`,
      type: mimeType
    }
  });

  console.log('Document Summary:', result.output);
}

// Example 5: Multiple Images Comparison (Sequential)
async function compareImages(image1Path: string, image2Path: string) {
  const img1Buffer = fs.readFileSync(image1Path);
  const img2Buffer = fs.readFileSync(image2Path);
  
  const base64Image1 = `data:image/jpeg;base64,${img1Buffer.toString('base64')}`;
  const base64Image2 = `data:image/jpeg;base64,${img2Buffer.toString('base64')}`;

  const compareFn = wrap((input: MultimodalInput) => input, {
    provider: 'openai',
    model: 'gpt-4o',
    customPrompt: 'Compare these two images and describe the differences.'
  });

  // Note: This sends one image at a time. For actual multi-image support,
  // you'd need to extend the library or use provider-specific features
  console.log('Analyzing first image...');
  const result1 = await compareFn({
    text: 'First image',
    image: base64Image1
  });

  console.log('Analyzing second image...');
  const result2 = await compareFn({
    text: 'Second image',
    image: base64Image2
  });

  console.log('Image 1 Analysis:', result1.output);
  console.log('Image 2 Analysis:', result2.output);
}

// Run examples
async function main() {
  try {
    console.log('=== Image Analysis Example ===');
    // await analyzeImage('./test-image.jpg');

    console.log('\n=== OCR Example ===');
    // await extractTextFromImage('./document.png');

    console.log('\n=== Code Review from Screenshot ===');
    // await reviewCodeScreenshot('./code-screenshot.png');

    console.log('\n=== Document Analysis Example ===');
    // await analyzeDocument('./document.pdf');

    console.log('\n=== Image Comparison Example ===');
    // await compareImages('./image1.jpg', './image2.jpg');

    console.log('\nAll examples completed!');
    console.log('\nNote: Uncomment the function calls and provide actual image paths to run.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();

export {
  analyzeImage,
  extractTextFromImage,
  reviewCodeScreenshot,
  analyzeDocument,
  compareImages,
  main
};

