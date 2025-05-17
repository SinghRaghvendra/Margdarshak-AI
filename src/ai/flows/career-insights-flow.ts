
'use server';
/**
 * @fileOverview Provides astrological and numerological insights for a selected career.
 *
 * - generateCareerInsights - A function that takes birth details and a selected career to return insights.
 * - CareerInsightsInput - The input type for the generateCareerInsights function.
 * - CareerInsightsOutput - The return type, containing astrological and numerological reviews.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerInsightsInputSchema = z.object({
  selectedCareer: z.string().describe('The career path chosen by the user.'),
  dateOfBirth: z.string().describe('User\'s date of birth in YYYY-MM-DD format.'),
  placeOfBirth: z.string().describe('User\'s city and country of birth.'),
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

export async function generateCareerInsights(input: CareerInsightsInput): Promise<CareerInsightsOutput> {
  return careerInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerInsightsPrompt',
  input: {schema: CareerInsightsInputSchema},
  output: {schema: CareerInsightsOutputSchema},
  prompt: `You are an AI assistant providing astrological and numerological insights for career guidance.
Based on the user's birth details and selected career, provide:

1.  **Astrological Review (approx. 150-200 words):** Discuss potential astrological alignments, strengths, challenges, or general considerations for the selected career: **{{{selectedCareer}}}**.
    User Details:
    - Date of Birth: {{{dateOfBirth}}}
    - Time of Birth: {{{timeOfBirth}}}
    - Place of Birth: {{{placeOfBirth}}}

2.  **Numerological Review (approx. 150-200 words):** Based on the Date of Birth: {{{dateOfBirth}}}, discuss how numerology (e.g., Life Path Number, Destiny Number if calculable from DOB alone) might relate to the user's approach, potential success, or challenges in the selected career: **{{{selectedCareer}}}**.

Important Guidelines:
- Frame these reviews as perspectives for consideration, not as definitive predictions or absolute truths.
- Use a supportive, encouraging, and positive tone.
- Avoid making specific, unverifiable claims. Focus on general themes and potentials.
- Ensure the output is well-formatted in Markdown (e.g., use bolding for subheadings if appropriate, paragraphs).
- Do not include any disclaimers like "This is for entertainment purposes only" directly in your response. Your tone and framing should suffice.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE', // Astrology/numerology might be seen as less harmful in some contexts.
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }
});

const careerInsightsFlow = ai.defineFlow(
  {
    name: 'careerInsightsFlow',
    inputSchema: CareerInsightsInputSchema,
    outputSchema: CareerInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate career insights. The AI model did not return a valid output.");
    }
    return output;
  }
);
