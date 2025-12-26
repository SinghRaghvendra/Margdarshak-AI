
'use server';
/**
 * @fileOverview Provides astrological and numerological insights for a selected career.
 * This file uses a direct, self-contained API call for stability and to avoid auth conflicts.
 */

import { z } from 'zod';

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
 * Performs a direct REST API call to the Gemini API using a standard API key.
 * This is isolated from Genkit or other SDKs to ensure simple, predictable authentication.
 */
async function callGeminiWithApiKey(
  prompt: string,
  model = "gemini-2.5-flash",
  maxTokens = 1024
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI Service Authentication Failed: The GEMINI_API_KEY environment variable is not set on the server.");
  }
  
  const safetySettings = [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.6,
          responseMimeType: "application/json",
        },
        safetySettings,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data.error);
    throw new Error(data.error?.message || `The AI model failed to respond. Status: ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.warn("Gemini Response Missing Text:", data);
    throw new Error("The AI model returned an empty or invalid response.");
  }

  return text;
}

/**
 * Defensively extracts a JSON object from a string that might contain other text or markdown.
 * It finds the first '{' and the last '}' to isolate the JSON content.
 */
function extractJSON(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.error("RAW AI RESPONSE (no JSON object found):", text);
    throw new Error('Could not find a valid JSON object in the AI response.');
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
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
        const text = await callGeminiWithApiKey(prompt, "gemini-2.5-flash", 1024);
        
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
