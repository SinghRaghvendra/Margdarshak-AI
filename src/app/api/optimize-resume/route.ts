
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
      You are an expert career coach and resume writer functioning as a single JSON API. Your primary goal is to produce a valid, complete JSON object. Brevity is more important than detail.

      RULES:
      - Respond ONLY with a single, valid JSON object. Do not include \`\`\`json wrappers or any other text.
      - THE ENTIRE RESPONSE MUST BE AS SHORT AS POSSIBLE TO AVOID BEING CUT OFF.
      - For all analysis fields (strengths, weaknesses, etc.), use short, impactful bullet points.
      - For each resume template, create a highly condensed, one-page version. Use short sentences and bullet points.

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
        "interviewPrep": "string (Markdown bulleted list of 3-5 potential interview questions)",
        "resumes": {
          "simple": "Markdown for a clean, standard resume. MUST BE CONCISE.",
          "professional": "Markdown for a formal, classic resume. MUST BE CONCISE.",
          "minimal": "Markdown for a compact, modern resume. MUST BE CONCISE."
        }
      }

      --- MARKDOWN STRUCTURE GUIDELINES FOR EACH TEMPLATE ---

      1.  **"simple" Template Structure:**
          -   Name: # Your Name
          -   Contact Info: Single line | Example: _youremail@example.com | (555) 123-4567_
          -   Sections: ## Section Title
          -   Job Roles: ### Job Title | Company
          -   Dates/Location: _City | Month Year - Month Year_
          -   Bullet points: * Use short, action-oriented phrases.

      2.  **"professional" Template Structure:**
          -   Name: # YOUR NAME (All caps)
          -   Contact Info: Single line with • separator.
          -   Sections: ## SECTION TITLE (All caps, followed by ---).
          -   Job Roles: ### Job Title
          -   Company/Dates: **Company** | _City | Month Year - Month Year_
          -   Bullet points: * Use concise, professional language.

      3.  **"minimal" Template Structure:**
          -   Name: # Your Name
          -   Contact Info: Single paragraph.
          -   Sections: **Section Title** (Bold).
          -   Job Roles & Company: **Job Title,** *Company*
          -   Dates/Location: _City | Month Year - Month Year_
          -   Bullet points: * Use extremely brief phrases.
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
    const responseText = await callGeminiWithApiKey(combinedPrompt, 8192);
    
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
