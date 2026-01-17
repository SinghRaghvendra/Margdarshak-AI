
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

// --- Combined Prompt for Analysis and Multiple Resume Templates ---
function getCombinedResumePrompt(resumeText: string, jobDescription: string): string {
    return `
      You are an expert career coach and resume writer functioning as a single JSON API. Your primary goal is to produce a valid, complete JSON object.

      **KEY OBJECTIVES:**
      1.  **Maximize Match:** Rewrite the user's resume to achieve a match score of over 90% against the job description by strategically incorporating keywords and aligning experiences.
      2.  **Professional Length:** The final rewritten resumes should be comprehensive but professionally concise, ideally fitting within two pages.
      3.  **Strict JSON Output:** The entire response MUST be a single, raw, valid JSON object without any extra text, explanations, or markdown wrappers like \`\`\`json.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **RESPONSE JSON SCHEMA:**
      {
        "matchScore": "string (e.g., '92%')",
        "strengths": "string (Markdown with detailed paragraphs and bullet points of top 3-4 strengths)",
        "weaknesses": "string (Markdown with detailed paragraphs and bullet points of top 3-4 weaknesses)",
        "skillGap": "string (Markdown with detailed bullet points of missing skills and suggestions to fill them)",
        "interviewPrep": "string (Markdown with a list of 5-7 potential interview questions with sample answers/talking points)",
        "resumes": {
          "simple": "Markdown for a clean, ATS-friendly, comprehensive resume (aim for 2 pages max).",
          "professional": "Markdown for a formal, classic, detailed resume (aim for 2 pages max).",
          "minimal": "Markdown for a modern, well-structured, but comprehensive resume (aim for 2 pages max)."
        }
      }

      **MARKDOWN GUIDELINES FOR RESUME TEMPLATES:**
      - **"simple":** Name (#), Contact (_email | phone_), Summary (## Summary), Sections (## Title), Job Roles (### Title | Company), Dates (_City | Month Year - Month Year_), Bullets (* action-oriented phrases with metrics).
      - **"professional":** Name (# YOUR NAME), Contact (line with • separator), Summary (## PROFESSIONAL SUMMARY ---), Sections (## TITLE ---), Job Roles (### Job Title), Company/Dates (**Company** | _City | Month Year - Month Year_), Bullets (* professional language with metrics).
      - **"minimal":** Name (#), Contact (paragraph), Summary (**Summary**), Sections (**Title**), Job Roles & Company (**Job Title,** *Company*), Dates (_City | Month Year - Month Year_), Bullets (* impactful phrases).
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

    // --- Single API call for both analysis and all resume versions ---
    const combinedPrompt = getCombinedResumePrompt(resumeText, jobDescription);
    const responseText = await callGeminiWithApiKey(combinedPrompt, 10000);
    
    if (!responseText) {
        throw new Error("The AI model returned an empty response.");
    }

    const finalResult = extractJSON(responseText);

    // Validate the structure
    if (!finalResult.resumes || !finalResult.resumes.simple || !finalResult.resumes.professional || !finalResult.resumes.minimal) {
        throw new Error("AI response was missing one or more resume templates.");
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
