
'use server';

/**
 * @fileOverview A flow that provides a detailed career report in Markdown format.
 * This file is now DEPRECATED. The logic has been moved to the server-side
 * API route at /api/generate-and-save-report to prevent client-side stack overflows.
 */

import {z} from 'zod';

const PersonalizedAnswersSchema = z.object({
  q1: z.string(), q2: z.string(), q3: z.string(), q4: z.string(), q5: z.string(),
});

const GenerateRoadmapInputSchema = z.object({
  careerSuggestion: z.string(),
  userTraits: z.string(),
  country: z.string(),
  userName: z.string(),
  dateOfBirth: z.string(),
  timeOfBirth: z.string(),
  placeOfBirth: z.string(),
  age: z.number(),
  personalizedAnswers: PersonalizedAnswersSchema,
  matchScore: z.string(),
  personalityProfile: z.string(),
  lifePathNumber: z.number(),
  preferredLanguage: z.string(),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmapMarkdown: z.string(),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;


export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const errorMsg = "The generateRoadmap flow is deprecated and should not be called from the client. Use the /api/generate-and-save-report API route instead.";
    console.error(errorMsg);
    throw new Error(errorMsg);
}
