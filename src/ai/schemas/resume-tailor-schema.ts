/**
 * @fileOverview Zod schemas and TypeScript types for the resume tailor flow.
 * This file does not contain server-side logic and can be safely imported into client components.
 */

import { z } from 'zod';

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
