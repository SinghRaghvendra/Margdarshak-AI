
import { generateContent as genkitGenerateContent, generateReport as genkitGenerateReport } from './genai';

/**
 * @deprecated Use generateContent from @/ai/genai instead
 */
export async function generateContent(promptText: string, options?: { temperature?: number; maxOutputTokens?: number; }): Promise<string> {
    return genkitGenerateContent(promptText, options);
}

/**
 * @deprecated Use generateReport from @/ai/genai instead
 */
export async function generateReport(prompt: string) {
    return genkitGenerateReport(prompt);
}
