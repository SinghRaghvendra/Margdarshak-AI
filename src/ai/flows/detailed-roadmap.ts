
'use server';

/**
 * @fileOverview A flow that provides a detailed 5-year career roadmap in Markdown format.
 * Includes personal details, astrological/numerological reviews, salary expectations (localized by country with currency), and suggested courses.
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
  userName: z.string().describe("The user's full name."),
  dateOfBirth: z.string().describe("User's date of birth in YYYY-MM-DD format."),
  astrologicalReview: z.string().describe("The astrological review previously generated for the user and selected career. This should be included as-is in the report."),
  numerologicalReview: z.string().describe("The numerological review previously generated for the user and selected career. This should be included as-is in the report."),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmapMarkdown: z.string().describe('A comprehensive career report in Markdown format. It should start with "Personal Details" (Name, DOB, Country), followed by "Astrological Review", then "Numerological Review", and finally the "5-Year Career Roadmap". The roadmap should include: for each year, a title, a descriptive paragraph, expected salary (localized for the user\'s country, including currency symbol/name like "₹7,00,000 - ₹8,50,000 INR" or "$70,000 - $85,000 USD"), a list of suggested courses, and a list of key activities. Use Markdown headings for sections and sub-sections.'),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComprehensiveRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor preparing a comprehensive career report. The report should be in Markdown format and include the following sections in this order:

1.  **# Personal Details**
    -   **Name:** {{{userName}}}
    -   **Date of Birth:** {{{dateOfBirth}}}
    -   **Country for Career Focus:** {{{country}}}

2.  **# Astrological Review**
    {{{astrologicalReview}}}

3.  **# Numerological Review**
    {{{numerologicalReview}}}

4.  **# 5-Year Career Roadmap for {{{careerSuggestion}}}**
    Generate a detailed 5-year career roadmap for the career: **{{{careerSuggestion}}}**, considering the user traits: {{{userTraits}}} and their country: {{{country}}}.
    The roadmap should be well-structured and easy to read.
    For each of the 5 years, include the following sections using Markdown:
    -   A main heading for the year (e.g., "## Year 1: Foundation Building").
    -   **Title:** A concise title for the year's focus.
    -   **Description:** A paragraph describing the objectives and focus for that year.
    -   **Expected Salary:** Provide an estimated salary range, localized for {{{country}}}. Crucially, **include the local currency symbol or name** (e.g., "₹7,00,000 - ₹8,50,000 INR", "$70,000 - $85,000 USD", "€60,000 - €75,000 EUR").
    -   **Suggested Courses:** A bulleted list of relevant courses.
    -   **Key Activities:** A bulleted list of activities to undertake (e.g., networking, projects).

User Traits to consider for the roadmap: {{{userTraits}}}

Ensure the entire output is a single Markdown string. Format lists clearly.
Example for courses:
- Course Name 1
- Course Name 2

Example for activities:
- Activity 1
- Activity 2
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateComprehensiveRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
