
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

/**
 * Performs a direct REST API call to the Gemini API.
 */
async function callGeminiWithApiKey(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI Service is unavailable: GEMINI_API_KEY is not set.");
  }
  
  const safetySettings = [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.4,
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * Extracts a JSON object from a string that might contain markdown or other text.
 */
function extractJSON(text: string): any {
  const match = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
  if (!match) {
    console.error("RAW AI RESPONSE (no JSON object found):", text);
    throw new Error('Could not find a valid JSON object in the AI response.');
  }
  const jsonString = match[1] || match[2];
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("JSON Parsing failed after extraction:", parseError, "--- Extracted String:", jsonString);
    throw new Error('The extracted text was not valid JSON.');
  }
}

function getResumeOptimizerPrompt(resumeText: string, jobDescription: string): string {
    return `
      You are an expert career coach and resume writer functioning as a JSON API.
      Your task is to analyze a user's resume against a job description and provide a detailed analysis and an optimized resume.

      RULES:
      - Respond ONLY with a valid JSON object wrapped in \`\`\`json markdown.
      - The JSON object must conform to the schema defined below.
      - All string values within the JSON must be formatted as Markdown for rich text rendering.
      - The optimizedResume should be plain text, ready for a .txt file.

      USER's RESUME:
      ---
      ${resumeText}
      ---

      JOB DESCRIPTION:
      ---
      ${jobDescription}
      ---

      RESPONSE JSON SCHEMA:
      {
        "matchScore": "string (e.g., '85%'). A qualitative score representing how well the resume matches the job description.",
        "strengths": "string (Markdown formatted). A bulleted list of the top 3-4 strengths from the resume that align with the job.",
        "weaknesses": "string (Markdown formatted). A bulleted list of the top 3-4 areas where the resume is weak in relation to the job description.",
        "skillGap": "string (Markdown formatted). A bulleted list of specific skills or technologies mentioned in the job description that are missing from the resume.",
        "interviewPrep": "string (Markdown formatted). A bulleted list of 3-5 potential interview questions based on the job description and the candidate's resume, along with a brief tip for each.",
        "optimizedResume": "string (Plain Text). A rewritten, ATS-friendly version of the resume. Incorporate keywords from the job description naturally. Use clear, simple formatting with standard headings (e.g., 'Experience', 'Education', 'Skills')."
      }
    `;
}


export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token.' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    getDb(); // Initialize Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // TODO: Implement usage tracking and paywall logic here in the future.
    
    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Resume and job description are required.' }, { status: 400 });
    }

    const prompt = getResumeOptimizerPrompt(resumeText, jobDescription);
    const aiResponseText = await callGeminiWithApiKey(prompt);
    
    if (!aiResponseText) {
        throw new Error("The AI model returned an empty or invalid response.");
    }

    const parsedJson = extractJSON(aiResponseText);

    return NextResponse.json(parsedJson);

  } catch (err: any) {
    console.error("optimize-resume API error:", err);
     if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
       return NextResponse.json({ error: 'Authentication failed. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
