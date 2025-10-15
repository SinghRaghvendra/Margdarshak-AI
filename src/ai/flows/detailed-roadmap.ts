'use server';

/**
 * @fileOverview A flow that provides a detailed career report in Markdown format.
 * Includes personal details, a 10-year age-specific roadmap (localized salary, courses, activities),
 * education guidance, skills focus, and a 20-year outlook based on future trends.
 *
 * - generateRoadmap - A function that generates a detailed career roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
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

const GenerateRoadmapInputSchema = z.object({
  careerSuggestion: z.string().describe('The suggested career for which to generate the roadmap.'),
  userTraits: z.string().describe('The user traits to consider when generating the roadmap.'),
  country: z.string().describe('The country of the user, to help localize salary expectations and career prospects.'),
  userName: z.string().describe("The user's full name."),
  dateOfBirth: z.string().describe("User's date of birth in YYYY-MM-DD format."),
  age: z.number().describe("User's current age."),
  personalizedAnswers: PersonalizedAnswersSchema.describe("User's answers to personalized questions."),
  matchScore: z.string().describe('The percentage match score for this career option (e.g., "85%").'),
  personalityProfile: z.string().describe('The descriptive personality profile associated with this career fit (e.g., "Analytical and Strategic", "Creative and Empathetic").'),
  preferredLanguage: z.string().describe('The user\'s preferred language for the report (e.g., "English", "Hindi", "Spanish"). This should apply to all textual content of the report.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmapMarkdown: z.string().describe(`A comprehensive career report in Markdown format, in the user's preferred language ({{{preferredLanguage}}}).
The report MUST follow this structure:
1.  "# Career Option: [Career Name]"
2.  "## Match Score: [Percentage Match Score]"
3.  "## Career Fit Assessment"
4.  "## Personal Details"
5.  "## Personality Profile Alignment"
6.  "## Career Prospect & Why It Is a Good Fit for You?"
7.  "## 10-Year Career Roadmap (Age-Specific for [Career Name])"
8.  "## Suggested Education, Courses & Programmes"
9.  "## Key Interests (Top 5)"
10. "## Expected Salary (Localized): Year 1, Year 5, Year 10"
11. "## 20-Year Outlook & Future Trends for [Career Name]"
12. "## Important Disclaimer" - Must be included and translated.
13. "Concluding Section" - Promotional text and links.
All sections must be in {{{preferredLanguage}}}.`),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinalComprehensiveReportPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `Generate a comprehensive career report in Markdown in **{{{preferredLanguage}}}**.
The report is for **{{{userName}}}** (Age: {{{age}}}, Country: {{{country}}}) for the career **{{{careerSuggestion}}}**.
Base the report on the user's traits and answers. STRICTLY AVOID astrological or numerological content.

**User Data:**
- Traits: {{{userTraits}}}
- Answers: {{{personalizedAnswers.q1}}}, {{{personalizedAnswers.q2}}}, {{{personalizedAnswers.q3}}}, {{{personalizedAnswers.q4}}}, {{{personalizedAnswers.q5}}}

**Report Structure (MUST BE IN {{{preferredLanguage}}}):**

# Career Option: {{{careerSuggestion}}}
## Match Score: {{{matchScore}}}
## Career Fit Assessment: A brief qualitative assessment of fit.
## Personal Details: Name, Age, Country.
## Personality Profile Alignment: {{{personalityProfile}}}: Briefly explain alignment with the career.
## Career Prospect & Why It Is a Good Fit for You?: Elaborate on career prospects and user fit.
## 10-Year Career Roadmap (Age-Specific for {{{careerSuggestion}}}): For each of the 10 years, provide: Title, Description, Localized Expected Salary (with currency), Suggested Courses, and Key Activities.
## Suggested Education, Courses & Programmes: Specific degrees, certifications, and courses.
## Key Interests (Top 5): List top 5 interests based on user data.
## Expected Salary (Localized for {{{country}}}): Salary ranges for Year 1, 5, and 10.
## 20-Year Outlook & Future Trends for {{{careerSuggestion}}}: Discuss future trends and skills.

---
## Important Disclaimer
(Translate to {{{preferredLanguage}}}) This AI-generated report is for informational and guidance purposes only. It is not a substitute for professional advice or personal judgment. Your career path is your own; use this as a source of inspiration.

---
(Translate to {{{preferredLanguage}}}) Need a professional career guide? We offer guidance to help you succeed. Annual subscription of Rs. 2999/-

**For further assistance:**
*   [➡️ Contact Our Career Counsellor](/contact)
*   [➡️ Subscribe Now for Professional Guidance (Rs. 2999/-)](/subscribe-guidance)
--- END OF REPORT ---
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateFinalComprehensiveReportFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid roadmap output for the final report.");
    }
    return output;
  }
);
