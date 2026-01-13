
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

/**
 * Performs a direct REST API call to the Gemini API.
 */
async function callGeminiWithApiKey(prompt: string, maxTokens: number) {
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
          maxOutputTokens: maxTokens,
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
 * Defensively extracts a JSON object from a string that might contain other text or markdown.
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

// --- PROMPT 1: For generating ONLY the JSON analysis ---
function getResumeAnalysisPrompt(resumeText: string, jobDescription: string): string {
    return `
      You are an expert career coach functioning as a JSON API. Your task is to analyze a user's resume against a job description.

      RULES:
      - Respond ONLY with a valid JSON object.
      - Do NOT include markdown \`\`\`json wrappers or any explanatory text.
      - All string values within the JSON must be formatted as Markdown.

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
        "matchScore": "string (e.g., '85%')",
        "strengths": "string (Markdown bulleted list of top 3-4 strengths)",
        "weaknesses": "string (Markdown bulleted list of top 3-4 weaknesses)",
        "skillGap": "string (Markdown bulleted list of missing skills)",
        "interviewPrep": "string (Markdown bulleted list of 3-5 potential interview questions)"
      }
    `;
}

// --- PROMPT 2: For rewriting ONLY the resume text ---
function getResumeRewritePrompt(resumeText: string, jobDescription: string, analysis: any): string {
    return `
      You are an expert resume writer. Your task is to rewrite the user's resume to be ATS-friendly and better aligned with the provided job description.
      
      RULES:
      - Respond ONLY with the plain text of the rewritten resume.
      - Do NOT include any other text, titles, or explanations.
      - Incorporate keywords from the job description naturally.
      - Use clear, simple formatting with standard headings (e.g., 'Experience', 'Education', 'Skills').
      - Use the provided analysis to guide your rewrite, focusing on addressing the weaknesses and skill gaps.

      USER's ORIGINAL RESUME:
      ---
      ${resumeText}
      ---

      JOB DESCRIPTION:
      ---
      ${jobDescription}
      ---

      AI ANALYSIS (for your reference):
      ---
      Strengths: ${analysis.strengths}
      Weaknesses to Address: ${analysis.weaknesses}
      Skills to Add: ${analysis.skillGap}
      ---

      Return only the rewritten resume content as plain text.
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

    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Resume and job description are required.' }, { status: 400 });
    }

    // --- STEP 1: Get the JSON Analysis ---
    const analysisPrompt = getResumeAnalysisPrompt(resumeText, jobDescription);
    const analysisResponseText = await callGeminiWithApiKey(analysisPrompt, 4096);
    
    if (!analysisResponseText) {
        throw new Error("The AI model returned an empty response for the analysis step.");
    }
    const analysisJson = extractJSON(analysisResponseText);


    // --- STEP 2: Get the Rewritten Resume ---
    const rewritePrompt = getResumeRewritePrompt(resumeText, jobDescription, analysisJson);
    const optimizedResumeText = await callGeminiWithApiKey(rewritePrompt, 4096);

    if (!optimizedResumeText) {
        throw new Error("The AI model returned an empty response for the resume rewrite step.");
    }
    
    // --- STEP 3: Combine and return the final result ---
    const finalResult = {
        ...analysisJson,
        optimizedResume: optimizedResumeText,
    };

    return NextResponse.json(finalResult);

  } catch (err: any) {
    console.error("optimize-resume API error:", err);
     if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
       return NextResponse.json({ error: 'Authentication failed. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
