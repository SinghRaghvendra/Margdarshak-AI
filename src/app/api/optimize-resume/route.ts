
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

// --- PROMPT FOR ANALYSIS ---
function getAnalysisPrompt(resumeText: string, jobDescription: string): string {
    return `
      You are an expert career coach analyzing a resume against a job description. Your response MUST be a single, raw, valid JSON object without any extra text or markdown wrappers.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **RESPONSE JSON SCHEMA (be concise but insightful):**
      {
        "matchScore": "string (e.g., '92%')",
        "strengths": "string (Markdown with 3-4 concise bullet points of top strengths)",
        "weaknesses": "string (Markdown with 3-4 concise bullet points of top weaknesses)",
        "skillGap": "string (Markdown with concise bullet points of missing skills)",
        "interviewPrep": "string (Markdown with a list of 5 potential interview questions and brief talking points)"
      }
    `;
}

// --- PROMPT FOR A SINGLE RESUME TEMPLATE ---
function getSingleResumePrompt(resumeText: string, jobDescription: string, templateName: 'simple' | 'professional' | 'minimal'): string {
    const templateGuidelines = {
        simple: `- **"simple":** Name (#), Contact (_email | phone_), Summary (## Summary), Sections (## Title), Job Roles (### Title | Company), Dates (_City | Month Year - Month Year_), Bullets (* action-oriented phrases with metrics).`,
        professional: `- **"professional":** Name (# YOUR NAME), Contact (line with • separator), Summary (## PROFESSIONAL SUMMARY ---), Sections (## TITLE ---), Job Roles (### Job Title), Company/Dates (**Company** | _City | Month Year - Month Year_), Bullets (* professional language with metrics).`,
        minimal: `- **"minimal":** Name (#), Contact (paragraph), Summary (**Summary**), Sections (**Title**), Job Roles & Company (**Job Title,** *Company*), Dates (_City | Month Year - Month Year_), Bullets (* impactful phrases).`
    };
    
    return `
      You are an expert resume writer rewriting a resume to match a job description, using a specific template. Your response MUST be a single, raw, valid JSON object containing only the rewritten resume in Markdown.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **TASK:**
      Rewrite the resume to maximize its match to the job description (aiming for over 90%), making it concise (ideally one page), and formatting it as Markdown using the **"${templateName}"** style.

      **MARKDOWN GUIDELINE:**
      ${templateGuidelines[templateName]}
      
      **RESPONSE JSON SCHEMA:**
      {
        "resume": "string (The full, rewritten resume in Markdown format.)"
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

    // --- Re-architected to use multiple, smaller API calls to avoid truncation ---
    
    // Call 1: Get the analysis
    const analysisPrompt = getAnalysisPrompt(resumeText, jobDescription);
    const analysisText = await callGeminiWithApiKey(analysisPrompt, 2048); // Analysis part is smaller
    if (!analysisText) {
        throw new Error("The AI model returned an empty response for the analysis part.");
    }
    const analysisResult = extractJSON(analysisText);

    // Calls 2, 3, 4: Get each resume template concurrently
    const templates: ('simple' | 'professional' | 'minimal')[] = ['simple', 'professional', 'minimal'];
    const resumePromises = templates.map(templateName => {
        const resumePrompt = getSingleResumePrompt(resumeText, jobDescription, templateName);
        return callGeminiWithApiKey(resumePrompt, 4096); // 4k tokens should be plenty for one resume
    });

    const resumeResultsText = await Promise.all(resumePromises);
    
    const resumes = {
        simple: extractJSON(resumeResultsText[0]).resume,
        professional: extractJSON(resumeResultsText[1]).resume,
        minimal: extractJSON(resumeResultsText[2]).resume,
    };

    // --- Assemble the final result ---
    const finalResult = {
        ...analysisResult,
        resumes: resumes,
    };

    // Validate the final structure
    if (!finalResult.resumes || !finalResult.resumes.simple || !finalResult.resumes.professional || !finalResult.resumes.minimal) {
        throw new Error("AI response was missing one or more resume templates after assembly.");
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
