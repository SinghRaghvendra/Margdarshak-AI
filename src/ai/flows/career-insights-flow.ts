
'use server';
/**
 * @fileOverview Provides astrological and numerological insights for a selected career.
 * This file has been refactored to use the central /api/gemini route for stability.
 */

import { z } from 'zod';
import { callGeminiApi } from '@/app/api/gemini/route';

// Define Zod schemas for clear, validated input and output.
const CareerInsightsInputSchema = z.object({
  selectedCareer: z.string().describe('The career path chosen by the user.'),
  dateOfBirth: z.string().describe("User's date of birth in YYYY-MM-DD format."),
  placeOfBirth: z.string().describe("User's city and country of birth."),
  timeOfBirth: z.string().describe('User\'s time of birth, including AM/PM if applicable (e.g., "10:30 AM" or "14:45").'),
});
export type CareerInsightsInput = z.infer<typeof CareerInsightsInputSchema>;

const CareerInsightsOutputSchema = z.object({
  astrologicalReview: z
    .string()
    .describe('An astrological review (approx. 150-200 words) discussing potential alignments or considerations for the selected career, based on birth details. Formatted in Markdown.'),
  numerologicalReview: z
    .string()
    .describe('A numerological review (approx. 150-200 words) based on the date of birth, discussing how numerology might relate to success or challenges in the selected career. Formatted in Markdown.'),
});
export type CareerInsightsOutput = z.infer<typeof CareerInsightsOutputSchema>;

/**
 * Defensively extracts a JSON object from a string that might contain other text or markdown.
 * It finds the first '{' and the last '}' to isolate the JSON content.
 * @param text The text from the AI response.
 * @returns The parsed JSON object.
 */
function extractJSON(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    // If we can't find a valid JSON structure, throw an error.
    console.error("RAW AI RESPONSE (no JSON object found):", text);
    throw new Error('Could not find a valid JSON object in the AI response.');
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  
  try {
    // Attempt to parse the extracted string
    return JSON.parse(jsonString);
  } catch (parseError) {
    // If parsing fails, log the details and throw a specific error
    console.error("JSON Parsing failed after extraction:", parseError, "--- Extracted String:", jsonString);
    throw new Error('The extracted text was not valid JSON.');
  }
}

// Export a simple async function to be called from the frontend.
export async function generateCareerInsights(input: CareerInsightsInput): Promise<CareerInsightsOutput> {
  const prompt = `
    You are an AI assistant functioning as a JSON API.
    RULES:
    - Respond ONLY with a valid JSON object.
    - Do NOT include markdown \`\`\`json wrappers.
    - Do NOT include any explanations or introductory text.
    - Do NOT include any text outside of the JSON object.
    - The final output MUST be a raw JSON object.

    Based on the user's details, provide astrological and numerological insights for their selected career.
    
    USER DETAILS:
    - Selected Career: ${input.selectedCareer}
    - Date of Birth: ${input.dateOfBirth}
    - Time of Birth: ${input.timeOfBirth}
    - Place of Birth: ${input.placeOfBirth}

    RESPONSE JSON SCHEMA:
    {
      "astrologicalReview": "string (approx. 150-200 words, markdown is allowed INSIDE this string)",
      "numerologicalReview": "string (approx. 150-200 words, markdown is allowed INSIDE this string)"
    }

    Tone and Content Guidelines:
    - Frame reviews as perspectives for consideration, not definitive predictions.
    - Use a supportive, encouraging, and positive tone.
    - Avoid making specific, unverifiable claims. Focus on general themes.
    - Do not include disclaimers in the response content itself.
    `;
    
    try {
        const text = await callGeminiApi(prompt, "gemini-2.5-flash", 1024);
        
        if (!text) {
             throw new Error("The AI model returned an empty response for career insights.");
        }
        
        const parsedResponse = extractJSON(text);

        // Validate the structure of the parsed response
        if (typeof parsedResponse.astrologicalReview !== 'string' || typeof parsedResponse.numerologicalReview !== 'string') {
            console.error("Invalid AI response schema:", parsedResponse);
            throw new Error("AI response was received but did not match the required data structure.");
        }
        
        return CareerInsightsOutputSchema.parse(parsedResponse);

    } catch (error: any) {
        console.error("Failed to process AI response for career insights:", error);
        throw new Error(`The AI model's response could not be understood for career insights. Details: ${error.message}`);
    }
}
