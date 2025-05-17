
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits and personalized answers.
 *
 * - suggestCareers - A function that takes user traits and personalized answers, and returns career suggestions.
 * - CareerSuggestionInput - The input type for the suggestCareers function.
 * - CareerSuggestionOutput - The return type for the suggestCareers function, containing an array of careers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAnswersSchema = z.object({
  q1: z.string().describe("Answer to: Describe your ideal workday. What kind of tasks energize you, and what kind of tasks drain you?"),
  q2: z.string().describe("Answer to: What are some of your hobbies or activities you genuinely enjoy outside of work or study? What do you like about them?"),
  q3: z.string().describe("Answer to: Imagine yourself 5 years from now. What achievements, big or small, would make you feel proud and fulfilled in your professional life?"),
  q4: z.string().describe("Answer to: Are there any specific industries or types of companies that particularly interest you or you feel drawn to? Why?"),
  q5: z.string().describe("Answer to: What are your primary motivations when thinking about a career? (e.g., financial security, making an impact, continuous learning, work-life balance, creativity, leadership, etc.). Please elaborate."),
});

const CareerSuggestionInputSchema = z.object({
  traits: z
    .string()
    .describe(
      'A summary of the user traits, skills, and preferences as determined by the psychometric test. This is a string concatenating user responses to various questions.'
    ),
  personalizedAnswers: PersonalizedAnswersSchema.describe('User\'s answers to personalized questions about their interests, work style, and vision.'),
});
export type CareerSuggestionInput = z.infer<typeof CareerSuggestionInputSchema>;

const CareerSuggestionOutputSchema = z.object({
  careers: z
    .array(z.string())
    .length(3)
    .describe(
      'An array of three distinct career options based on the user traits and personalized answers.'
    ),
});
export type CareerSuggestionOutput = z.infer<typeof CareerSuggestionOutputSchema>;

export async function suggestCareers(input: CareerSuggestionInput): Promise<CareerSuggestionOutput> {
  return suggestCareersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerSuggestionWithPersonalizationPrompt',
  input: {schema: CareerSuggestionInputSchema},
  output: {schema: CareerSuggestionOutputSchema},
  prompt: `You are an expert career counselor. Based on the following psychometric test traits and personalized answers, suggest three distinct and suitable career options.

Psychometric Traits Summary:
{{{traits}}}

Personalized Answers:
1. Ideal Workday: {{{personalizedAnswers.q1}}}
2. Hobbies & Interests: {{{personalizedAnswers.q2}}}
3. 5-Year Vision: {{{personalizedAnswers.q3}}}
4. Industry Interest: {{{personalizedAnswers.q4}}}
5. Career Motivations: {{{personalizedAnswers.q5}}}

Return the three career suggestions as an array of strings within the JSON object. Ensure the array is named "careers" and contains exactly three string elements.
Consider all provided information to make relevant and diverse suggestions.
`,
});

const suggestCareersFlow = ai.defineFlow(
  {
    name: 'suggestCareersWithPersonalizationFlow',
    inputSchema: CareerSuggestionInputSchema,
    outputSchema: CareerSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid output for career suggestions.");
    }
    return output;
  }
);
