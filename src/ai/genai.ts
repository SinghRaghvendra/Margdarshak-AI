
'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from '@google/generative-ai';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    // This will cause a build-time error if the key is not set, which is good for catching misconfigurations early.
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

// Use lazy initialization for the genAI instance
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return genAI;
}

type GenOptions = {
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
    responseMimeType?: 'text/plain' | 'application/json';
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];


export async function generateContent(promptText: string, options?: GenOptions): Promise<string> {
    const modelToUse = options?.model || 'gemini-2.5-flash';
    
    try {
        const client = getGenAI();
        const model = client.getGenerativeModel({ 
            model: modelToUse,
            safetySettings: safetySettings,
            generationConfig: {
                maxOutputTokens: options?.maxOutputTokens,
                temperature: options?.temperature,
                responseMimeType: options?.responseMimeType,
            }
        });

        const result = await model.generateContent(promptText);
        const response = result.response;
        const text = response.text();
        
        if (!text) {
             throw new Error('The AI model returned an empty response.');
        }

        return text;

    } catch (err: any) {
        console.error(`[AI_SDK_ERROR] Failed to generate content with model ${modelToUse}:`, err);
        // Re-throw a more user-friendly error
        throw new Error(`The AI model failed to process the request. Details: ${err.message}`);
    }
}

export async function generateReport(prompt: string) {
    return generateContent(prompt, { model: 'gemini-2.5-flash', temperature: 0.8, maxOutputTokens: 8192 });
}
