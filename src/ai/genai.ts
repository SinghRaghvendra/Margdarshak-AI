
'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

// Lazy init
let genAI: GoogleGenerativeAI | null = null;
function getGenAI() {
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI;
}

type GenOptions = {
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  responseMimeType?: 'text/plain' | 'application/json';
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

export async function generateContent(promptText: string, options?: GenOptions): Promise<string> {
  const modelId = options?.model || 'gemini-2.5-flash';

  try {
    // Defensive logging based on your excellent suggestion
    console.log(`[AI_REQUEST_INFO] Model: ${modelId}, Prompt Length: ${promptText.length}, Max Tokens: ${options?.maxOutputTokens ?? 4096}`);
    if (promptText.length > 30000) {
        console.warn(`[AI_REQUEST_WARNING] Prompt length (${promptText.length}) is very high and may exceed model limits.`);
    }

    const client = getGenAI();
    // Model initialization is now cleaner
    const model = client.getGenerativeModel({ 
      model: modelId,
      safetySettings // Safety settings can be part of model init
    });

    // generationConfig and responseMimeType are correctly passed into the generateContent call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        maxOutputTokens: options?.maxOutputTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        ...(options?.responseMimeType && { responseMimeType: options.responseMimeType }),
      },
    });
    
    const response = result.response;
    const text = response.text();

    if (!text && response.promptFeedback?.blockReason) {
        throw new Error(`Request was blocked. Reason: ${response.promptFeedback.blockReason}`);
    }

    if (!text) {
      throw new Error("The AI model returned an empty response with no explicit block reason.");
    }

    return text;

  } catch (err: any) {
    console.error(`[AI_SDK_ERROR] Failed to generate content with model ${modelId}:`, err);
    throw new Error(`The AI model failed to process the request. Details: ${err.message}`);
  }
}

export async function generateReport(prompt: string) {
  return generateContent(prompt, {
    model: 'gemini-2.5-flash',
    temperature: 0.8,
    maxOutputTokens: 8192,
  });
}
