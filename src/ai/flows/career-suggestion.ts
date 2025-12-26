
'use server';
/**
 * @fileOverview Provides AI-powered career suggestions based on user traits and personalized answers.
 * This file uses a direct, self-contained API call for stability and to avoid auth conflicts.
 */

import {z} from 'zod';

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
 * Performs a direct REST API call to the Gemini API using a standard API key.
 * This is isolated from Genkit or other SDKs to ensure simple, predictable authentication.
 */
async function callGeminiWithApiKey(
  prompt: string,
  model = "gemini-2.5-flash",
  maxTokens = 8192
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI Service Authentication Failed: The GEMINI_API_KEY environment variable is not set on the server.");
  }
  
  const safetySettings = [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.5,
          responseMimeType: "application/json",
        },
        safetySettings,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data.error);
    throw new Error(data.error?.message || `The AI model failed to respond. Status: ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.warn("Gemini Response Missing Text:", data);
    throw new Error("The AI model returned an empty or invalid response.");
  }

  return text;
}

/**
 * Defensively extracts a JSON object from a string that might contain other text or markdown.
 * It finds the first '{' and the last '}' to isolate the JSON content.
 */
function extractJSON(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.error("RAW AI RESPONSE (no JSON object found):", text);
    throw new Error('Could not find a valid JSON object in the AI response.');
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("JSON Parsing failed after extraction:", parseError, "--- Extracted String:", jsonString);
    throw new Error('The extracted text was not valid JSON.');
  }
}

const getBasePrompt = () => {
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
      
      Analyze the user's trait data and their personalized answers to generate three highly relevant career suggestions. The trait data comes from a detailed psychometric test covering personality, interests, values, cognitive style, and social preferences.
    `;
};

export async function suggestCareers(input: CareerSuggestionInput): Promise<CareerSuggestionOutput> {
    const prompt = `
    ${getBasePrompt()}

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
        const text = await callGeminiWithApiKey(prompt, "gemini-2.5-flash");
        
        if (!text) {
             throw new Error("The AI model returned an empty response for career suggestions.");
        }

        const parsedResponse = extractJSON(text);
        
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
