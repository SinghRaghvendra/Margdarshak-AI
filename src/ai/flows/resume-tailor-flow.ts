
'use server';
/**
 * @fileOverview Provides AI-powered resume tailoring and cover letter generation.
 *
 * - tailorResume - A function that takes a resume, job description, and optional instructions to generate a tailored resume and cover letter.
 * - ResumeTailorInput - The input type for the tailorResume function.
 * - ResumeTailorOutput - The return type, containing the tailored resume, cover letter, and ATS insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ResumeTailorInputSchema = z.object({
  resumeText: z.string().min(50, {message: 'Resume text must be at least 50 characters.'}).describe('The full text content of the user\'s resume.'),
  jobDescription: z.string().min(50, {message: 'Job description must be at least 50 characters.'}).describe('The full text of the target job description.'),
  additionalInstructions: z.string().optional().describe('Optional user instructions to guide the AI, e.g., "Emphasize my leadership skills."'),
});
export type ResumeTailorInput = z.infer<typeof ResumeTailorInputSchema>;

export const ResumeTailorOutputSchema = z.object({
  tailoredResume: z.string().describe('The full, professionally formatted tailored resume text in Markdown. This should include a professional summary, rewritten work experience bullet points, and a focused skills section.'),
  coverLetter: z.string().describe('The full, professionally written and compelling cover letter, tailored to the job and company.'),
  atsScoreBefore: z.number().min(0).max(100).describe('An estimated ATS match score (0-100) for the original resume against the job description.'),
  atsScoreAfter: z.number().min(0).max(100).describe('An estimated ATS match score (0-100) for the newly tailored resume against the job description.'),
  matchedKeywords: z.array(z.string()).describe('A list of the top keywords from the job description that were successfully matched and included in the tailored resume.'),
  improvementSuggestions: z.array(z.string()).describe('A short list of actionable suggestions for further improvement.'),
});
export type ResumeTailorOutput = z.infer<typeof ResumeTailorOutputSchema>;

export async function tailorResume(input: ResumeTailorInput): Promise<ResumeTailorOutput> {
  return resumeTailorFlow(input);
}

const resumeTailorPrompt = ai.definePrompt({
  name: 'resumeTailorPrompt',
  input: {schema: ResumeTailorInputSchema},
  output: {schema: ResumeTailorOutputSchema},
  prompt: `You are an expert career coach and professional resume writer. Your task is to analyze the provided resume and job description, then rewrite and tailor the resume to be a perfect fit for the job, and finally, write a compelling cover letter.

**User's Original Resume Text:**
\`\`\`
{{{resumeText}}}
\`\`\`

**Target Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**Optional Instructions from User:**
{{#if additionalInstructions}}
\`\`\`
{{{additionalInstructions}}}
\`\`\`
{{else}}
None
{{/if}}

**Your Tasks:**

**1. Analyze and Estimate ATS Scores:**
   - First, analyze the original resume against the job description and estimate an initial ATS score (a percentage from 0-100).
   - After you have tailored the resume, estimate the improved ATS score.

**2. Tailor the Resume (Output as Markdown):**
   - **Parse the resume:** Accurately identify all sections (contact info, experience, education, skills, projects).
   - **Create a Professional Summary:** Write a concise, 2-3 sentence professional summary/objective that immediately highlights the candidate's value for this specific role.
   - **Optimize Work Experience:** For each job entry, rewrite the bullet points. Use powerful action verbs and, where possible, quantify achievements. These rewritten points MUST align with the requirements and responsibilities in the job description.
   - **Focus the Skills Section:** From the candidate's full skill list, generate a focused list of the top 10 most relevant skills for the target job.
   - **Format Professionally:** The final resume must be clean, professional, and well-formatted in Markdown. Use a clear structure.

**3. Generate a Cover Letter (Output as Markdown):**
   - Write a complete, professional, and compelling cover letter.
   - It must be tailored to the specific job and company.
   - Highlight the candidate's key strengths, drawing from the newly optimized resume.
   - Express genuine interest in the role and company.

**4. Provide ATS Insights:**
   - **Matched Keywords:** Identify and list the top keywords from the job description that you successfully integrated into the tailored resume.
   - **Improvement Suggestions:** Provide a short list of actionable suggestions for further improvement that the user could make.

**IMPORTANT:** Ensure the final output strictly adheres to the JSON schema with all the required fields: \`tailoredResume\`, \`coverLetter\`, \`atsScoreBefore\`, \`atsScoreAfter\`, \`matchedKeywords\`, \`improvementSuggestions\`. The resume and cover letter must be in Markdown format.
`,
});

const resumeTailorFlow = ai.defineFlow(
  {
    name: 'resumeTailorFlow',
    inputSchema: ResumeTailorInputSchema,
    outputSchema: ResumeTailorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid output for the resume tailor task.");
    }
    return output;
  }
);
