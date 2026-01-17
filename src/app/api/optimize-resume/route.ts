
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

/**
 * Performs a direct REST API call to the Gemini API.
 */
async function callGeminiWithApiKey(
    prompt: string, 
    maxTokens: number
) {
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
          responseMimeType: 'application/json',
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
  if (!text) {
    throw new Error('Cannot extract JSON from an empty or null response text.');
  }
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

// --- CONSOLIDATED PROMPT FOR ANALYSIS & ONE RESUME ---
function getCombinedOptimizationPrompt(resumeText: string, jobDescription: string): string {
    return `
      You are an expert career coach and resume writer. Your task is to analyze a resume against a job description and then provide a full rewrite of the resume in ATS-friendly Markdown. Your response MUST be a single, raw, valid JSON object without any extra text or markdown wrappers.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **TASK:**
      1.  Analyze the resume against the job description.
      2.  Rewrite the resume to be concise (ideally one page), ATS-friendly, and tailored to maximize the match for the job description. Use a clean, professional Markdown format.

      **RESPONSE JSON SCHEMA:**
      {
        "matchScore": "string (e.g., '92%')",
        "strengths": "string (Markdown with 3-4 concise bullet points of top strengths)",
        "weaknesses": "string (Markdown with 3-4 concise bullet points of top weaknesses)",
        "skillGap": "string (Markdown with concise bullet points of missing skills)",
        "interviewPrep": "string (Markdown with a list of 5 potential interview questions and brief talking points)",
        "optimizedResume": "string (The full, rewritten resume in professional, ATS-friendly Markdown format.)"
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

    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Resume and job description are required.' }, { status: 400 });
    }

    // --- Simplified to a single, more reliable API call ---
    const combinedPrompt = getCombinedOptimizationPrompt(resumeText, jobDescription);
    const resultText = await callGeminiWithApiKey(combinedPrompt, 8192); // Use a single, large token limit

    if (!resultText) {
        throw new Error("The AI model returned an empty response.");
    }

    const finalResult = extractJSON(resultText);

    // --- Validate the final structure ---
    if (!finalResult.optimizedResume || !finalResult.matchScore) {
        throw new Error("AI response was missing the optimized resume or analysis.");
    }
    
    return NextResponse.json(finalResult);

  } catch (err: any) {
    console.error("optimize-resume API error:", err);
     if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
       return NextResponse.json({ error: 'Authentication failed. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
