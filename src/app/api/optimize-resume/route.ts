
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
    const exampleFormat = `
# Tanya Verma
### Software Engineer
+91-99999999XX | abc@gmail.com | Hyderabad, India | Experience: 2 years 3 months | linkedin.com/abc

Passionate software engineer with over 5 years of experience in building scalable, high-performance applications. Expertise in distributed systems, cloud computing, and delivering impactful solutions that drive business success. Adept at problem-solving, optimizing systems, and enhancing user experiences in fast-paced environments.
***
## SKILLS
***
*   Software Engineer - Amazon
*   Distributed Systems
*   Cloud Computing (AWS)
*   Data Structures and Algorithms
*   SQL
*   Python
*   Docker
*   Kubernetes
*   System Design
***
## CERTIFICATION
***
*   SAFe 6 Product Owner/Product Manager
*   Full Stack Software Developer Assessment
***
## WORK EXPERIENCE
***
### Software Engineer - Amazon (Jun 2019 - Present)
#### Key Contributions
*   **Revolutionized Personalization:** Designed a scalable recommendation engine for Amazon Prime Video, boosting user engagement by 20% and significantly improving personalized content delivery.
*   **Architected Scalable Solutions:** Played a key role in developing a micro services-based architecture for Amazon's fulfillment system, reducing deployment time by 25% and increasing system modularity.
#### Innovation and Problem-Solving
*   **High Availability Systems:** Created a fault-tolerant, real-time order tracking system, increasing uptime to 99.99% across regions, ensuring uninterrupted service.
*   **Data-Driven Forecasting:** Developed a predictive analytics tool for warehouse demand forecasting, reducing overstocking by 15% and optimizing inventory management.
***
## INTERNSHIPS
***
### Software Development Intern, Flipkart (3 Months)
*   Developed a new feature for the customer returns module...
`;

    return `
      You are an expert career coach and resume writer. Your task is to analyze a resume against a job description and then provide a full rewrite of the resume in a specific Markdown format. Your response MUST be a single, raw, valid JSON object without any extra text or markdown wrappers.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **TASK:**
      1.  **Analysis:** Analyze the user's resume against the job description.
      2.  **Rewrite:** Rewrite the resume to be concise, ATS-friendly, and tailored to the job description.
      3.  **Formatting:** The "optimizedResume" field in your JSON response MUST be a string containing Markdown that strictly follows the structure and style of the example below.

      **MARKDOWN FORMAT EXAMPLE:**
      \`\`\`markdown
      ${exampleFormat}
      \`\`\`

      **RESPONSE JSON SCHEMA (Strictly adhere to this):**
      {
        "matchScore": "string (e.g., '92%')",
        "strengths": "string (Markdown with 3-4 concise bullet points)",
        "weaknesses": "string (Markdown with 3-4 concise bullet points)",
        "skillGap": "string (Markdown with concise bullet points)",
        "interviewPrep": "string (Markdown with 5 potential interview questions and brief talking points)",
        "optimizedResume": "string (The full, rewritten resume in the specific Markdown format shown in the example.)"
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
