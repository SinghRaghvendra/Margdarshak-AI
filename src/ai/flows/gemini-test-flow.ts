'use server';
/**
 * @fileOverview A simple flow to test the Gemini API connection.
 *
 * - testGemini - A function that calls the Gemini API with a simple prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestGeminiOutputSchema = z.object({
  message: z.string().describe('A success message from the Gemini API.'),
});
export type TestGeminiOutput = z.infer<typeof TestGeminiOutputSchema>;

export async function testGemini(): Promise<TestGeminiOutput> {
  return testGeminiFlow();
}

const prompt = ai.definePrompt({
  name: 'testGeminiPrompt',
  output: {schema: TestGeminiOutputSchema},
  prompt: `Generate a short success message. Say 'Gemini API is operational.'`,
});

const testGeminiFlow = ai.defineFlow(
  {
    name: 'testGeminiFlow',
    outputSchema: TestGeminiOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }
    return output;
  }
);
