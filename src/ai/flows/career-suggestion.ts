// src/ai/flows/career-suggestion.ts
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits.
 *
 * - suggestCareers - A function that takes user traits and returns career suggestions.
 * - CareerSuggestionInput - The input type for the suggestCareers function.
 * - CareerSuggestionOutput - The return type for the suggestCareers function.
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
  careers: z
    .array(z.string())
    .length(3)
    .describe(
      'A list of three suitable career options based on the user traits.'
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
  prompt: `You are an expert career counselor. Based on the following traits, skills, and interests, suggest three suitable career options.

Traits: {{{traits}}}

Return the careers as a JSON array of strings.`,
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
