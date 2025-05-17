
'use server';

/**
 * @fileOverview A flow that provides a detailed career report in Markdown format.
 * Includes personal details, astrological/numerological reviews, a 5-year roadmap (localized salary, courses, activities),
 * education guidance, study goals, skills focus, and a 20-year outlook based on future trends.
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
  roadmapMarkdown: z.string().describe(`A comprehensive career report in Markdown format. It should include the following sections in order:
1.  "Personal Details" (Name, DOB, Country).
2.  "Astrological Review".
3.  "Numerological Review".
4.  "5-Year Career Roadmap": For each year, include a title, a descriptive paragraph, expected salary (localized for the user's country, including currency symbol/name like "₹7,00,000 - ₹8,50,000 INR" or "$70,000 - $85,000 USD"), a list of suggested courses, and a list of key activities.
5.  "Education Guidance": Advice on relevant degrees, certifications, or academic paths.
6.  "Study Goals": Specific learning objectives and milestones.
7.  "Skills to Focus On": Key technical and soft skills.
8.  "20-Year Outlook & Future Trends": Perspective on career evolution over two decades, considering future trends and long-term growth.
Use Markdown headings for all sections and sub-sections.`),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComprehensiveRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor preparing a comprehensive career report. The report must be in Markdown format and include the following sections in this exact order:

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

5.  **# Education Guidance**
    Provide guidance on relevant degrees (e.g., Bachelor's, Master's, PhD), important certifications, and other academic paths beneficial for pursuing a career in {{{careerSuggestion}}}. Tailor this advice considering general best practices for this field.

6.  **# Study Goals**
    Outline specific, actionable study goals for someone starting out in {{{careerSuggestion}}}. These could include mastering foundational concepts, learning specific tools or technologies, or achieving certain academic milestones. Phrase these as bullet points.

7.  **# Skills to Focus On**
    Detail the key skills (technical, soft, and domain-specific if applicable) that are crucial for success and growth in {{{careerSuggestion}}}. Explain why each skill is important. Present as bullet points or short paragraphs for each skill cluster.

8.  **# 20-Year Outlook & Future Trends for {{{careerSuggestion}}}**
    Provide a forward-looking perspective on how the field of {{{careerSuggestion}}} might evolve over the next 20 years. Discuss potential technological advancements, shifts in demand, emerging specializations, and key future trends. What skills will likely remain valuable or become even more critical? How can one prepare for long-term success?

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
    if (!output) {
      throw new Error("The AI model did not return a valid roadmap output.");
    }
    return output;
  }
);
