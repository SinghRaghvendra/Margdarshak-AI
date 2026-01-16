
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
      You are an expert career coach and resume writer functioning as a single JSON API. Your task is to analyze a user's resume against a job description and then generate three distinct, optimized resume versions in Markdown.

      RULES:
      - Respond ONLY with a single, valid JSON object.
      - Do NOT include markdown \`\`\`json wrappers or any explanatory text.
      - The final output must be a raw JSON object, starting with { and ending with }.
      - All string values for analysis (strengths, weaknesses, etc.) must be formatted as Markdown bulleted lists.
      - VERY IMPORTANT: The content for each resume template MUST be concise. Aim for a one-page resume. Brevity is essential to avoid response truncation and ensure a valid JSON output.

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
          "simple": "Markdown for a clean, standard resume.",
          "professional": "Markdown for a formal, classic resume.",
          "minimal": "Markdown for a compact, modern resume."
        }
      }

      --- MARKDOWN STRUCTURE GUIDELINES FOR EACH TEMPLATE ---

      1.  **"simple" Template Structure:**
          -   Use a single-column layout.
          -   Name: # Your Name
          -   Contact Info: A single paragraph, separated by pipes (|). Example: _youremail@example.com | (555) 123-4567 | linkedin.com/in/yourprofile_
          -   Sections (Summary, Experience, Education, Skills): ## Section Title
          -   Job Roles: ### Job Title | Company Name
          -   Dates/Location: _City, State | Month Year - Month Year_
          -   Bullet points: * Responsibility or achievement.

      2.  **"professional" Template Structure:**
          -   Use a single-column, classic layout.
          -   Name: # YOUR NAME (All caps)
          -   Contact Info: Single paragraph, separated by bullets (•).
          -   Sections: ## SECTION TITLE (All caps, followed by a horizontal rule ---).
          -   Job Roles: ### Job Title
          -   Company/Dates: **Company Name** | _City, State | Month Year - Month Year_
          -   Bullet points: * Responsibility or achievement.

      3.  **"minimal" Template Structure:**
          -   Use a highly compact, single-column layout.
          -   Name: # Your Name
          -   Contact Info: Single paragraph.
          -   Sections: **Section Title** (Bold, no '##').
          -   Job Roles & Company: **Job Title,** *Company Name*
          -   Dates/Location: _City, State | Month Year - Month Year_ (On the same line as the job role if possible, otherwise below).
          -   Bullet points: * Responsibility or achievement. Use concise language.
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
