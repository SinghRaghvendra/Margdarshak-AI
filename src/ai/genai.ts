
'use server';

/**
 * @deprecated This file is deprecated and should not be used.
 * All Gemini API calls should go through the centralized /api/gemini route.
 * This file is kept to avoid breaking existing imports but will be removed in the future.
 */

type GenOptions = {
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  responseMimeType?: 'text/plain' | 'application/json';
};

const DEPRECATION_ERROR_MESSAGE = "This function is deprecated. All AI generation should be handled by the /api/gemini API route for stability and security.";

export async function generateContent(promptText: string, options?: GenOptions): Promise<string> {
  console.error(DEPRECATION_ERROR_MESSAGE, { promptText, options });
  throw new Error(DEPRECATION_ERROR_MESSAGE);
}

export async function generateReport(prompt: string) {
  console.error(DEPRECATION_ERROR_MESSAGE, { prompt });
  throw new Error(DEPRECATION_ERROR_MESSAGE);
}
