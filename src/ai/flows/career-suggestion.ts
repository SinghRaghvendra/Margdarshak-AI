// src/ai/flows/career-suggestion.ts
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits.
 *
 * - suggestCareers - A function that takes user traits and returns a single career suggestion.
 * - CareerSuggestionInput - The input type for the suggestCareers function.
 * - CareerSuggestionOutput - The return type for the suggestCareers function, containing a single career.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerSuggestionInputSchema = z.object({
  traits: z
    .string()
    .describe(
      'A description of the user traits, skills, and interests, as determined by the psychometric test.'
    ),
});
export type CareerSuggestionInput = z.infer<typeof CareerSuggestionInputSchema>;

const CareerSuggestionOutputSchema = z.object({
  career: z
    .string()
    .describe(
      'The single most suitable career option based on the user traits.'
    ),
});
export type CareerSuggestionOutput = z.infer<typeof CareerSuggestionOutputSchema>;

export async function suggestCareers(input: CareerSuggestionInput): Promise<CareerSuggestionOutput> {
  return suggestCareersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerSuggestionPrompt',
  input: {schema: CareerSuggestionInputSchema},
  output: {schema: CareerSuggestionOutputSchema},
  prompt: `You are an expert career counselor. Based on the following traits, skills, and interests, suggest the single most suitable career option.

Traits: {{{traits}}}

Return the single career as part of the JSON object.`,
});

const suggestCareersFlow = ai.defineFlow(
  {
    name: 'suggestCareersFlow',
    inputSchema: CareerSuggestionInputSchema,
    outputSchema: CareerSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
