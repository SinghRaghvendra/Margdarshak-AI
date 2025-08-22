
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits and personalized answers.
 *
 * - suggestCareers - A function that takes user traits and personalized answers, and returns career suggestions with rationales, match scores, and personality profiles.
 * - CareerSuggestionInput - The input type for the suggestCareers function.
 * - CareerSuggestionOutput - The return type for the suggestCareers function, containing an array of career objects.
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

const CareerObjectSchema = z.object({
  name: z.string().describe('The name of the suggested career.'),
  matchScore: z.string().describe('An estimated percentage match score (e.g., "85%") indicating the AI\'s assessment of fit based on user data. This is a qualitative assessment expressed numerically.'),
  personalityProfile: z.string().describe('A brief descriptive personality profile (e.g., "Creative and Empathetic", "Analytical and Independent", "Strategic Thinker") derived from user traits that aligns with the suggested career.'),
  rationale: z.string().describe('A brief 1-2 sentence explanation of why this career is a good fit, linking to the user\'s traits and personalized answers.'),
});

const CareerSuggestionOutputSchema = z.object({
  careers: z
    .array(CareerObjectSchema)
    .min(7)
    .max(10) // Aim for 10 suggestions
    .describe(
      'An array of seven to ten distinct career options, each with a name, matchScore, personalityProfile, and a rationale, based on the user traits and personalized answers.'
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
  prompt: `You are an expert career counselor. Based on the following psychometric test traits and personalized answers, suggest ten distinct and suitable career options.
For each career suggestion, provide:
1.  'name': The name of the career.
2.  'matchScore': An estimated percentage match score (e.g., "85%", "92%") based on the AI's assessment of how well the career aligns with the user's traits and answers. This score represents a qualitative assessment expressed numerically.
3.  'personalityProfile': A brief descriptive personality profile (e.g., "Creative and Empathetic", "Analytical and Independent", "Strategic Thinker") derived from the user's traits that aligns with the suggested career. Avoid formal psychological classifications like MBTI unless explicitly derivable and highly relevant; focus on descriptive terms.
4.  'rationale': A brief (1-2 sentences) explanation of why this career is a good fit, clearly linking it to the user's traits and personalized answers provided below.

Psychometric Traits Summary:
{{{traits}}}

Personalized Answers:
1. Ideal Workday: {{{personalizedAnswers.q1}}}
2. Hobbies & Interests: {{{personalizedAnswers.q2}}}
3. 5-Year Vision: {{{personalizedAnswers.q3}}}
4. Industry Interest: {{{personalizedAnswers.q4}}}
5. Career Motivations: {{{personalizedAnswers.q5}}}

Return the ten career suggestions as an array of objects within the JSON object. Each object in the array must have a "name" field (string), a "matchScore" field (string, e.g., "90%"), a "personalityProfile" field (string), and a "rationale" field (string). The array should be named "careers".
Consider all provided information to make relevant and diverse suggestions with insightful details for each field.
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
    // Ensure we return a maximum of 10, even if the model provides more (though schema should cap it)
    if (output.careers.length > 10) {
      output.careers = output.careers.slice(0, 10);
    }
    return output;
  }
);
