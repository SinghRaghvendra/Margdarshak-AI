
'use server';
/**
 * @fileOverview Provides astrological and numerological insights for a selected career.
 * This file has been refactored to use the central /api/gemini route for stability.
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

// Export a simple async function to be called from the frontend.
export async function generateCareerInsights(input: CareerInsightsInput): Promise<CareerInsightsOutput> {
  const prompt = `You are an AI assistant providing astrological and numerological insights for career guidance.
    Based on the user's birth details and selected career, provide:
    
    1.  **Astrological Review (approx. 150-200 words):** Discuss potential astrological alignments, strengths, challenges, or general considerations for the selected career: ${input.selectedCareer}.
        User Details:
        - Date of Birth: ${input.dateOfBirth}
        - Time of Birth: ${input.timeOfBirth}
        - Place of Birth: ${input.placeOfBirth}
    
    2.  **Numerological Review (approx. 150-200 words):** Based on the Date of Birth: ${input.dateOfBirth}, discuss how numerology (e.g., Life Path Number, Destiny Number if calculable from DOB alone) might relate to the user's approach, potential success, or challenges in the selected career: ${input.selectedCareer}.
    
    Important Guidelines:
    - Frame these reviews as perspectives for consideration, not as definitive predictions or absolute truths.
    - Use a supportive, encouraging, and positive tone.
    - Avoid making specific, unverifiable claims. Focus on general themes and potentials.
    - Ensure the output is well-formatted in Markdown.
    - Do not include any disclaimers like "This is for entertainment purposes only" directly in your response. Your tone and framing should suffice.
    - Adhere strictly to the requested JSON output format. Respond ONLY with a raw JSON object matching this schema: { "astrologicalReview": "...", "numerologicalReview": "..." }.
    `;
    
    try {
        const response = await fetch(`/api/gemini`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                model: "gemini-2.5-flash",
                maxOutputTokens: 1024,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
        }

        if (!data.text) {
             throw new Error("The AI model returned an empty response for career insights.");
        }
        
        const parsedResponse = JSON.parse(data.text);
        return CareerInsightsOutputSchema.parse(parsedResponse);
    } catch (error: any) {
        console.error("Failed to process AI response for career insights:", error);
        throw new Error(`The AI model's response could not be understood for career insights. Details: ${error.message}`);
    }
}
