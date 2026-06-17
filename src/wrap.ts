// dotenv removed - using explicit provider initialization instead
import { getProvider, getProviderChain } from "./providers";
import { WrapOptions, TaskType, Provider, DEFAULT_MODEL } from "./types";
import { AIHookError } from "./errors";

function handleError(err: unknown): never {
  if (err && typeof err === "object" && "pretty" in err && typeof (err as any).pretty === "function") {
    // Print pretty message
    console.error((err as any).pretty());
    // Only exit in Node.js test environment, not in browser
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
      process.exit(1);
    }
    // In browser or test mode, just throw the error instead of exiting
    throw err;
  } else {
    console.error(err);
    // Only exit in Node.js test environment, not in browser
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
      process.exit(1);
    }
    // In browser or test mode, just throw the error instead of exiting
    throw err;
  }
}

export interface MultimodalInput {
  text?: string;
  image?: string; // base64 encoded image
  file?: { name: string; data: string; type: string };
}

export function wrap<T extends (...args: any[]) => any, P extends Provider | undefined = undefined>(
  fn: T,
  options: WrapOptions<P>
): (...args: Parameters<T>) => Promise<{ output: string; meta: any }> {
  // Validate task type immediately when wrap() is called
  const validTasks: TaskType[] = ["summarize", "translate", "explain", "rewrite", "sentiment", "codeReview"];
  if (options.task && !validTasks.includes(options.task)) {
    throw new AIHookError(
      "INVALID_TASK",
      `Invalid task type: ${options.task}. Valid tasks are: ${validTasks.join(", ")}`,
      options.provider as Provider | undefined,
      "Please use one of the supported task types."
    );
  }

  return async (...args: Parameters<T>) => {
    try {
      // Await the function result to handle both sync and async functions
      const rawInput = fn(...args);
      const input = rawInput instanceof Promise ? await rawInput : rawInput;

      // Check if input is multimodal
      const isMultimodal = typeof input === 'object' && input !== null && ('image' in input || 'file' in input);
      const textInput = isMultimodal ? (input as MultimodalInput).text || '' : String(input);
      const imageData = isMultimodal ? (input as MultimodalInput).image : undefined;
      const fileData = isMultimodal ? (input as MultimodalInput).file : undefined;

      // Step 1: get the ordered provider chain for automatic fallback
      const chain = getProviderChain(options.provider as Provider | undefined);

      if (chain.length === 0) {
        throw new AIHookError(
          "NO_PROVIDER_FOUND",
          "No valid AI provider API key was found.\n\nIf you are using a .env file, please ensure you have installed the 'dotenv' package (npm i dotenv) and called require('dotenv').config() at the very top of your entry file.\n\nAlternatively, you can initialize providers explicitly:\ninitAIHooks({ providers: [{ provider: 'openai', key: 'your-key-here' }] })",
          options.provider as Provider | undefined,
          "Reference documentation for initialization instructions."
        );
      }

      let lastError: unknown;
      const startTime = Date.now();

      for (const { fn: providerFn, provider: providerKey } of chain) {
        // Step 2: pick model: passed model or provider-specific default
        const model = options.model || (providerKey in DEFAULT_MODEL ? DEFAULT_MODEL[providerKey as Provider] : undefined);

        if (!model) {
          // Skip providers with no resolvable model (shouldn't normally happen)
          continue;
        }

        // Step 3: build prompt with multimodal support
        let prompt: string;
        if ((options as any).customPrompt) {
          prompt = `${(options as any).customPrompt}\n\n${textInput}`;
          if (imageData) prompt = `${prompt}\n\n[Image attached]`;
          if (fileData) prompt = `${prompt}\n\n[File: ${fileData.name}]`;
        } else {
          prompt = buildPrompt(options.task, textInput, (options as any).targetLanguage);
          if (imageData) prompt = `${prompt}\n\n[Image attached]`;
          if (fileData) prompt = `${prompt}\n\n[File: ${fileData.name}]`;
        }

        try {
          const output = await providerFn(prompt, model);
          const endTime = Date.now();

          // Success — if we used a fallback provider, log it
          if (options.provider && providerKey !== options.provider) {
            console.warn(`[ai-hooks] ⚠️  Fell back to provider: ${providerKey} (original: ${options.provider} failed)`);
          } else if (!options.provider && chain[0].provider !== providerKey) {
            console.warn(`[ai-hooks] ⚠️  Fell back to provider: ${providerKey}`);
          }

          return {
            output,
            meta: {
              provider: providerKey,
              model,
              task: options.task,
              targetLanguage: (options as any).targetLanguage,
              cached: false,
              estimatedCostUSD: 0.0,
              latencyMs: endTime - startTime,
              fallback: chain[0].provider !== providerKey
            }
          };
        } catch (err: unknown) {
          lastError = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          // Only log warning if there are more providers to try
          const idx = chain.findIndex(c => c.provider === providerKey);
          if (idx < chain.length - 1) {
            console.warn(`[ai-hooks] ⚠️  Provider "${providerKey}" failed (${errMsg}). Trying next provider...`);
          }
        }
      }

      // All providers exhausted — surface the last error
      throw lastError;
    } catch (err) {
      if (err instanceof AIHookError) {
        // Log the pretty message for developer visibility, then re-throw
        console.error((err as any).pretty());
        throw err;
      }
      handleError(err);
    }
  };
}

function buildPrompt(task: TaskType | undefined, text: string, targetLanguage?: string) {
  if (!task) {
    return text; // If no task specified, just return the text as-is
  }
  
  switch (task) {
    case "summarize":
      return `Summarize the following text:\n${text}`;
    case "translate":
      const language = targetLanguage || "English"; // default to English
      return `Translate this text into ${language}:\n${text}`;
    case "explain":
      return `Explain this clearly:\n${text}`;
    case "rewrite":
      return `Rewrite this text with better clarity:\n${text}`;
    case "sentiment":
      return `Analyze the sentiment of this text:\n${text}`;
    case "codeReview":
      return `Review this code and suggest improvements:\n${text}`;
    default:
      return text;
  }
}