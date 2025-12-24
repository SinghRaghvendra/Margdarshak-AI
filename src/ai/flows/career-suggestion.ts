
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits and personalized answers.
 * This file has been refactored to use the central /api/gemini route for stability.
 */

import {z} from 'zod';
import { callGeminiApi } from '@/app/api/gemini/route';

const PersonalizedAnswersSchema = z.object({
  q1: z.string().describe("Answer to: Describe your ideal workday. What kind of tasks energize you, and what kind of tasks drain you?"),
  q2: z.string().describe("Answer to: What are some of your hobbies or activities you genuinely enjoy outside of work or study? What do you like about them?"),
  q3: z.string().describe("Answer to: Imagine yourself 5 years from now. What achievements, big or small, would make you feel proud and fulfilled in your professional life?"),
  q4: z.string().describe("Are there any specific industries or types of companies that particularly interest you or you feel drawn to? Why?"),
  q5: z.string().describe("What are your primary motivations when thinking about a career? (e.g., financial security, making an impact, continuous learning, work-life balance, creativity, leadership, etc.). Please elaborate."),
});

const CareerSuggestionInputSchema = z.object({
  traits: z.record(z.record(z.union([z.string(), z.number()]))).describe(
      'A structured JSON object of the user traits, skills, and preferences as determined by the psychometric test.'
    ),
  personalizedAnswers: PersonalizedAnswersSchema.describe('User\'s answers to personalized questions about their interests, work style, and vision.'),
});
export type CareerSuggestionInput = z.infer<typeof CareerSuggestionInputSchema>;

const CareerObjectSchema = z.object({
  name: z.string().describe('The name of the suggested career.'),
  matchScore: z.string().describe('An estimated percentage match score (e.g., "87.26%") indicating the AI\'s assessment of fit based on user data. This is a qualitative assessment expressed numerically.'),
  personalityProfile: z.string().describe('A brief descriptive personality profile (e.g., "Creative and Empathetic", "Analytical and Independent", "Strategic Thinker") derived from user traits that aligns with the suggested career.'),
  rationale: z.string().describe('A very brief 1-sentence explanation of why this career is a good fit.'),
});

const CareerSuggestionOutputSchema = z.object({
  careers: z
    .array(CareerObjectSchema)
    .min(3)
    .max(3)
    .describe(
      'An array of exactly 3 career options, each with a name, matchScore, personalityProfile, and a concise rationale.'
    ),
});
export type CareerSuggestionOutput = z.infer<typeof CareerSuggestionOutputSchema>;

/**
 * Defensively extracts a JSON object from a string that might contain other text or markdown.
 * It finds the first '{' and the last '}' to isolate the JSON content.
 * @param text The text from the AI response.
 * @returns The parsed JSON object.
 */
function extractJSON(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    // If we can't find a valid JSON structure, throw an error.
    console.error("RAW AI RESPONSE (no JSON object found):", text);
    throw new Error('Could not find a valid JSON object in the AI response.');
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  
  try {
    // Attempt to parse the extracted string
    return JSON.parse(jsonString);
  } catch (parseError) {
    // If parsing fails, log the details and throw a specific error
    console.error("JSON Parsing failed after extraction:", parseError, "--- Extracted String:", jsonString);
    throw new Error('The extracted text was not valid JSON.');
  }
}


const getDecoderKeyPrompt = () => {
    return `
      You are an expert career counselor AI functioning as a JSON API.
      RULES:
      - Respond ONLY with a valid JSON object.
      - Do NOT include markdown \`\`\`json wrappers.
      - Do NOT include any explanations or introductory text.
      - Do NOT include any text outside of the JSON object.
      - The final output MUST be a raw JSON object.

      Your response must strictly follow this exact schema, providing exactly 3 career suggestions:
      {"careers":[{"name":"string","matchScore":"string (e.g., '87.26%')","personalityProfile":"string","rationale":"very short 1-sentence string"}, ...2 more objects]}
      
      **Trait Data Interpretation Key (25 Question Test):**
      The user's psychometric data is provided in a compressed JSON format. Here is how to interpret it:
  
      **1. Personality & Temperament (s1, Sliders):**
      - s1q1: 1 (Alone) to 5 (In a team)
      - s1q2: 1 (Logic) to 5 (Intuition)
      - s1q3: 1 (Spontaneous) to 5 (Organized)
      - s1q4: 1 (Introverted) to 5 (Extroverted)
      - s1q5: 1 (Calm under stress) to 5 (Feels pressured)

      **2. Interests & Enjoyment (s2, Choice-based):**
      - s2q1: Free afternoon? (a: Build/fix, b: Analyze/solve, c: Create/write)
      - s2q2: Job appeal? (a: Manage/lead, b: Research, c: Help/advise)
      - s2q3: Task type? (a: Practical/hands-on, b: Creative/unstructured, c: Organized/detailed)
      - s2q4: Documentary choice? (a: Tech, b: History, c: Psychology)
      - s2q5: Satisfaction source? (a: Achieve goal, b: Creative expression, c: Help others)

      **3. Motivation & Values (s3, Slider & Choice):**
      - s3q1: Career driver? 1 (Financial security) to 5 (Making an impact)
      - s3q2: Job type? 1 (Stable/predictable) to 5 (Dynamic/changing)
      - s3q3: Workplace values? (a: Innovation, b: Team harmony, c: Autonomy)
      - s3q4: Motivation source? 1 (Internal validation) to 5 (External recognition)
      - s3q5: Benefit appeal? (a: High salary, b: Flexibility, c: Professional development)

      **4. Cognitive Style (s4, Choice & Slider):**
      - s4q1: Problem approach? (a: Step-by-step, b: Brainstorm, c: Gut feeling)
      - s4q2: Learning style? (a: Structured course, b: Experimenting, c: Reading/absorbing)
      - s4q3: Focus? 1 (Big picture) to 5 (Details)
      - s4q4: Dataset instinct? (a: Find trends, b: Clean data, c: Visualize)
      - s4q5: Work preference? (a: Clearly defined, b: Open-ended, c: Mix of both)

      **5. Social & Work Environment Style (s5, Slider & Choice):**
      - s5q1: Work environment? 1 (Quiet/focused) to 5 (Social/collaborative)
      - s5q2: Communication preference? (a: Written, b: Face-to-face, c: Mix of both)
      - s5q3: Team conflict response? (a: Mediate, b: Stay out of it, c: Propose logical solution)
      - s5q4: Leadership preference? 1 (Lead) to 5 (Contribute)
      - s5q5: Feedback preference? (a: Direct, b: Gentle, c: Objective/data-driven)
    `;
};

export async function suggestCareers(input: CareerSuggestionInput): Promise<CareerSuggestionOutput> {
    const prompt = `
    ${getDecoderKeyPrompt()}

    User_Traits_JSON:
    ${JSON.stringify(input.traits)}
    
    **User's Personalized Answers (for qualitative context):**
    1. Ideal Workday: ${input.personalizedAnswers.q1}
    2. Hobbies & Interests: ${input.personalizedAnswers.q2}
    3. 5-Year Vision: ${input.personalizedAnswers.q3}
    4. Industry Interest: ${input.personalizedAnswers.q4}
    5. Career Motivations: ${input.personalizedAnswers.q5}
    `;
    
    try {
        const text = await callGeminiApi(prompt, "gemini-2.5-flash", 10000);
        
        if (!text) {
             throw new Error("The AI model returned an empty response for career suggestions.");
        }

        const parsedResponse = extractJSON(text);
        
        // Validate the structure of the parsed response
        if (!parsedResponse.careers || !Array.isArray(parsedResponse.careers) || parsedResponse.careers.length === 0) {
            console.error("Invalid AI response schema:", parsedResponse);
            throw new Error("AI response was received but did not contain a valid 'careers' array.");
        }
        
        return CareerSuggestionOutputSchema.parse(parsedResponse);
    } catch (error: any) {
        console.error("Failed to process AI response for career suggestions:", error);
        throw new Error(`The AI model's response could not be understood. Details: ${error.message}`);
    }
}

    