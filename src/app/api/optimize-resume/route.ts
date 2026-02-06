
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebaseAdmin';
import { VertexAI } from '@google-cloud/vertexai';

export const runtime = 'nodejs';

// Initialize Vertex AI client with credentials for local dev, or fallback to ADC for production.
let vertex_ai: VertexAI;
try {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const googleAuthOptions = credentialsJson
    ? { credentials: JSON.parse(credentialsJson) }
    : undefined;

  vertex_ai = new VertexAI({
    project: process.env.PROJECT_ID || process.env.FIREBASE_PROJECT_ID!,
    location: process.env.LOCATION || 'us-central1',
    googleAuthOptions,
  });
} catch (e: any) {
  // We need to handle this error at the top level of the module
  // to prevent the application from crashing on startup.
  console.error(`FATAL: Failed to initialize Vertex AI: ${e.message}`);
}

/**
 * Performs a secure, authenticated call to the Vertex AI API.
 */
async function callVertexAISecurely(
    prompt: string, 
    model = "gemini-2.5-flash",
    maxTokens = 8192,
    temperature = 0.4,
    isJsonOutput = false
) {
  if (!vertex_ai) {
      throw new Error("Vertex AI client is not initialized. Check server logs for initialization errors.");
  }
  const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: temperature,
      ...(isJsonOutput && { responseMimeType: "application/json" }),
    },
    safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    ],
  });

  const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };

  try {
    const resp = await generativeModel.generateContent(request);
    const response = resp.response;
    
    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
       console.warn("Vertex AI Response Missing Text:", response);
       throw new Error("The AI model returned an empty or invalid response.");
    }
    
    return response.candidates[0].content.parts[0].text;
  } catch (error: any) {
      console.error("Vertex AI SDK Error:", error);
      throw new Error(error.message || "The AI model failed to respond.");
  }
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
# John Doe
### Senior Software Engineer
+1-555-555-5555 | john.doe@email.com | San Francisco, CA | linkedin.com/in/johndoe

A highly motivated and results-oriented software engineer with 8+ years of experience in designing, developing, and deploying scalable and maintainable web applications. Proven ability to lead projects, mentor junior developers, and collaborate effectively in fast-paced Agile environments.
***
## SKILLS
***
*   **Languages:** JavaScript (ES6+), TypeScript, Python, Java
*   **Frameworks:** React, Node.js, Express, Spring Boot
*   **Databases:** PostgreSQL, MongoDB, Redis
*   **Cloud/DevOps:** AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD
***
## WORK EXPERIENCE
***
### Lead Software Engineer | Tech Solutions Inc. | (Jan 2020 - Present)
*   Led a team of 5 engineers to develop a new microservices-based e-commerce platform, resulting in a 40% increase in performance and a 25% reduction in server costs.
*   Architected and implemented a real-time inventory management system using WebSockets, reducing stock discrepancies by 95%.
*   Mentored junior engineers, conducted code reviews, and established best practices for a monorepo architecture.
### Software Engineer | Innovate Corp. | (Jun 2016 - Dec 2019)
*   Developed and maintained key features for a high-traffic social media application using React and Node.js.
*   Optimized database queries and implemented caching strategies that improved API response times by 50%.
***
## EDUCATION
***
### M.S. in Computer Science | University of California, Berkeley | (2014 - 2016)
### B.S. in Computer Science | University of Texas at Austin | (2010 - 2014)
`;

    return `
      You are an expert career coach and resume writer. Your task is to analyze a resume against a job description, then provide a comprehensive analysis and a full rewrite of the resume in a specific Markdown format.
      
      Your response MUST be a single, raw, valid JSON object without any extra text or markdown wrappers.

      **USER's RESUME:**
      ---
      ${resumeText}
      ---

      **JOB DESCRIPTION:**
      ---
      ${jobDescription}
      ---

      **TASK:**
      1.  **Analysis:** Provide a detailed analysis including match score, strengths, weaknesses, skill gap, and interview prep questions.
      2.  **Rewrite:** Rewrite the entire resume into a single, aesthetically pleasing, and professionally structured Markdown string. The resume should be ATS-friendly and tailored to the job description.
      3.  **Formatting:** The "optimizedResume" field MUST strictly follow the structure and style of the example below. Use markdown for structure (e.g., '#', '##', '###', '*', '**'). Use '***' for horizontal lines between major sections.

      **MARKDOWN FORMAT EXAMPLE (Strictly follow this structure):**
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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
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
    const resultText = await callVertexAISecurely(combinedPrompt, "gemini-2.5-flash", 8192, 0.4, true);

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
