
'use server';

/**
 * @fileOverview A flow that provides a detailed 5-year career roadmap in Markdown format, including salary expectations and suggested courses, localized by country.
 *
 * - generateRoadmap - A function that generates a detailed career roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoadmapInputSchema = z.object({
  careerSuggestion: z.string().describe('The suggested career for which to generate the roadmap.'),
  userTraits: z.string().describe('The user traits to consider when generating the roadmap.'),
  country: z.string().describe('The country of the user, to help localize salary expectations and career prospects.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmapMarkdown: z.string().describe('A detailed 5-year career roadmap in Markdown format. For each year, include: a title, a descriptive paragraph, expected salary (localized for the user\'s country), a list of suggested courses, and a list of key activities. Use Markdown headings for years and sub-sections like "Salary", "Courses", "Activities".'),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor. Generate a detailed 5-year career roadmap in Markdown format for the career: {{{careerSuggestion}}}, considering the user traits: {{{userTraits}}} and their country: {{{country}}}.
The roadmap should be well-structured and easy to read.
For each of the 5 years, include the following sections using Markdown:
- A main heading for the year (e.g., "## Year 1: Foundation Building").
- **Title:** A concise title for the year's focus.
- **Description:** A paragraph describing the objectives and focus for that year.
- **Expected Salary:** Provide an estimated salary range, localized for {{{country}}}.
- **Suggested Courses:** A bulleted list of relevant courses.
- **Key Activities:** A bulleted list of activities to undertake (e.g., networking, projects).

Ensure the output is a single Markdown string. Format lists clearly. Example for courses:
- Course Name 1
- Course Name 2

Example for activities:
- Activity 1
- Activity 2
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
