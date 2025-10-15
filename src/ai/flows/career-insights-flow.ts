'use server';
/**
 * @fileOverview Provides AI-powered insights for a selected career based on the user's profile.
 *
 * - generateCareerInsights - A function that takes user data and a selected career to return insights.
 * - CareerInsightsInput - The input type for the generateCareerInsights function.
 * - CareerInsightsOutput - The return type, containing a qualitative review.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CareerInsightsInputSchema = z.object({
  selectedCareer: z.string().describe('The career path chosen by the user.'),
  userTraits: z.string().describe('A summary of the user traits, skills, and preferences as determined by the psychometric test.'),
  personalizedAnswers: z.object({
    q1: z.string(),
    q2: z.string(),
    q3: z.string(),
    q4: z.string(),
    q5: z.string(),
  }).describe("User's answers to personalized questions."),
});
export type CareerInsightsInput = z.infer<typeof CareerInsightsInputSchema>;

const CareerInsightsOutputSchema = z.object({
  careerFitReview: z
    .string()
    .describe('A qualitative review (approx. 150 words) discussing how the user\'s psychometric traits and answers align with the selected career. This should be a helpful perspective, not a definitive judgment. Formatted in Markdown.'),
});
export type CareerInsightsOutput = z.infer<typeof CareerInsightsOutputSchema>;

export async function generateCareerInsights(input: CareerInsightsInput): Promise<CareerInsightsOutput> {
  return careerInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerInsightsPrompt',
  input: {schema: CareerInsightsInputSchema},
  output: {schema: CareerInsightsOutputSchema},
  prompt: `You are an AI career counseling assistant. Your goal is to provide a supportive and insightful perspective.
Based on the user's psychometric traits and personalized answers, provide a qualitative review for their selected career: **{{{selectedCareer}}}**.

**User's Psychometric Traits:**
{{{userTraits}}}

**User's Personalized Answers:**
- Ideal Workday: {{{personalizedAnswers.q1}}}
- Hobbies: {{{personalizedAnswers.q2}}}
- 5-Year Vision: {{{personalizedAnswers.q3}}}
- Industry Interest: {{{personalizedAnswers.q4}}}
- Motivations: {{{personalizedAnswers.q5}}}

**Your Task:**
Write a 'Career Fit Review' of approximately 150 words. Discuss potential alignments and strengths.
Use an encouraging and supportive tone. Frame the review as a helpful perspective, not a definitive judgment.
Ensure the output is formatted in Markdown.
DO NOT make specific, unverifiable claims or use esoteric practices.
`,
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
