
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebaseAdmin';
import { calculateLifePathNumber } from '@/lib/numerology';
import { differenceInYears, parseISO } from 'date-fns';
import { saveReport } from '@/services/report-service-server';
import { runTransaction } from 'firebase-admin/firestore';
import { VertexAI } from '@google-cloud/vertexai';

export const runtime = 'nodejs';

// Initialize Vertex AI
const PROJECT_ID = process.env.PROJECT_ID!;
const LOCATION = process.env.LOCATION!;
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });

/**
 * Performs a secure, authenticated call to the Vertex AI API.
 */
async function callVertexAISecurely(
  prompt: string,
  model = "gemini-1.5-flash-001",
  maxTokens = 8192,
  temperature = 0.7
) {
  const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: temperature,
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


// --- PROMPT GENERATION FUNCTIONS (omitted for brevity, they are unchanged) ---
function getVerdictPrompt(input: any) {
  return `
    You are an expert career counselor. Generate a concise "Career Verdict" report.
    The report MUST be in Markdown format and STRICTLY follow this structure.
    The ENTIRE textual content MUST be in: **${input.preferredLanguage}**.

    # Career Verdict for: ${input.userName}
    
    ## Top Career Match: ${input.careerSuggestion}
    
    ### Match Score: ${input.matchScore}
    
    ### Career Fit Assessment
    Provide a concise, qualitative assessment (2-3 paragraphs, approx. 200-250 words) of why this career is a strong fit for ${input.userName}. Base your analysis on their traits, personality profile, and answers to personalized questions. **Crucially, do NOT mention internal trait codes (e.g., 's1q1').** Refer to the concepts they represent (e.g., 'preference for teamwork,' 'creative interests').
    (Ensure all text is in ${input.preferredLanguage})
    
    ### Personality Profile Alignment: ${input.personalityProfile}
    Briefly elaborate (1-2 sentences) on how the user's personality profile (${input.personalityProfile}) aligns with the demands of ${input.careerSuggestion}. (In ${input.preferredLanguage})

    ---
    (The following promotional text must also be in ${input.preferredLanguage})
    You've unlocked your top career match! To understand your full potential, including your top 3 career options and a deep dive into your personality, upgrade to the full report.
    
    **For further assistance:**
    *   [➡️ Upgrade to Full Report](/career-suggestions)
    *   [➡️ Contact Our Career Counsellor](/contact)
    ---
    
    Return ONLY the raw markdown content. Do not include any other text or explanations.
    
    --- Internal Reference Data (Do NOT quote directly in the report) ---
    User Traits: ${JSON.stringify(input.userTraits)}
    Personalized Answers: ${JSON.stringify(input.personalizedAnswers)}
  `;
}

function getClarityPrompt(input: any) {
    return `
      You are an expert career counselor preparing a "Career Clarity Report".
      The report MUST be in Markdown format and STRICTLY follow the structure below.
      The ENTITÉ textual content MUST be in: **${input.preferredLanguage}**.
  
      # Career Clarity Report for: ${input.userName}
      
      ## 1. Top 3 Career Recommendations
      - **Primary Match: ${input.careerSuggestion} (Match Score: ${input.matchScore})**
      - **Alternative 1:** ${input.alternativeCareers[0].name} (Match Score: ${input.alternativeCareers[0].matchScore})
      - **Alternative 2:** ${input.alternativeCareers[1].name} (Match Score: ${input.alternativeCareers[1].matchScore})
  
      ## 2. In-Depth Analysis for: ${input.careerSuggestion}
      
      ### Career Fit Assessment
      Provide a qualitative assessment (2-3 paragraphs) of why this career is a strong fit for ${input.userName}. Base your analysis on their traits, personality profile, and answers to personalized questions. **Crucially, do NOT mention internal trait codes (e.g., 's1q1').** (In ${input.preferredLanguage})
  
      ### Personality Profile: ${input.personalityProfile}
      Elaborate on how the user's personality profile aligns with this career. Discuss strengths and potential blind spots or risk areas. (In ${input.preferredLanguage})
  
      ### General Career Demand (Localized for ${input.country})
      Briefly discuss the general demand and outlook for **${input.careerSuggestion}** in **${input.country}**. Is it a growing field? What is the general sentiment? (In ${input.preferredLanguage})
  
      ## 3. Astrological & Numerological Validation
      (This entire section must be in ${input.preferredLanguage})
  
      ### Astrological Insights
      Provide a concise textual overview (approx 150 words) describing key zodiac placements or characteristics based on the user's birth details. Frame this positively as potential influences for their career journey.
      
      ### Numerological Insights (Life Path Number: ${input.lifePathNumber})
      Briefly explain the general meaning of Life Path Number ${input.lifePathNumber}. Then, provide a short analysis (approx 100 words) on how this number's traits could support them in their chosen career path.
  
      ---
      (The following promotional text must also be in ${input.preferredLanguage})
      You now have clarity on your best-fit careers! To get a step-by-step 10-year plan to achieve success in ${input.careerSuggestion}, unlock your full Career Blueprint.
      
      **For further assistance:**
      *   [➡️ Unlock Your 10-Year Career Blueprint](/career-suggestions)
      *   [➡️ Contact Our Career Counsellor](/contact)
      ---
  
      Return ONLY the raw markdown content.
      
      --- Internal Reference Data (Do NOT quote directly) ---
      User Details: DOB: ${input.dateOfBirth}, Time: ${input.timeOfBirth}, Place: ${input.placeOfBirth}
      User Traits: ${JSON.stringify(input.userTraits)}
      Personalized Answers: ${JSON.stringify(input.personalizedAnswers)}
    `;
  }
  

  function getBlueprintPrompt(input: any) {
    return `You are an expert career counselor preparing a comprehensive, personalized career report.
    The report MUST be in Markdown format and STRICTLY follow the structure and content guidelines below.
    The ENTIRE textual content of the report (headings, descriptions, predictions, advice, etc.) MUST be in the following language: **${input.preferredLanguage}**.
    
    Report for: ${input.userName}
    Chosen Career: ${input.careerSuggestion}
    User's Current Age: ${input.age}
    User's Country (for localization): ${input.country}
    User's Date of Birth: ${input.dateOfBirth}
    User's Time of Birth: ${input.timeOfBirth}
    User's Place of Birth: ${input.placeOfBirth}
    User Traits Summary (for internal reference, do not quote these codes in the report): ${JSON.stringify(input.userTraits)}
    User's Personalized Answers:
    Ideal Workday: ${input.personalizedAnswers.q1}
    Hobbies & Interests: ${input.personalizedAnswers.q2}
    5-Year Vision: ${input.personalizedAnswers.q3}
    Industry Interest: ${input.personalizedAnswers.q4}
    Career Motivations: ${input.personalizedAnswers.q5}
    User's Life Path Number: ${input.lifePathNumber}
    
    --- START OF REPORT MARKDOWN (in ${input.preferredLanguage}) ---
    
    # Career Option: ${input.careerSuggestion}
    
    ## Match Score: ${input.matchScore}
    
    ## Career Fit Assessment
    Provide a qualitative assessment (2-3 sentences) of why this career is a strong, moderate, or developing fit for ${input.userName}, based on their traits, answers, and personality profile alignment. **Crucially, do NOT mention the internal trait codes (e.g., 's1q1', 's2q3') in your response.** Instead, refer to the concepts they represent (e.g., 'preference for teamwork,' 'creative interests'). (Ensure this text is in ${input.preferredLanguage})
    
    ## Personal Details
    - **Name:** ${input.userName}
    - **DOB:** ${input.dateOfBirth}
    - **Age:** ${input.age}
    - **Country:** ${input.country}
    (Field names like "Name", "DOB", "Age", "Country" should be translated to ${input.preferredLanguage} if appropriate for that language's conventions in reports, otherwise keep them in English but ensure the values are presented correctly.)
    
    ## Personality Profile Alignment: ${input.personalityProfile}
    Briefly elaborate (1-2 sentences) on how the user's personality profile (${input.personalityProfile}) aligns with the demands and characteristics of the career in ${input.careerSuggestion}. (Ensure this text is in ${input.preferredLanguage})
    
    ## Astrological Insights & Zodiac Chart Overview
    (This entire section's text must be in ${input.preferredLanguage})
    Provide a textual overview that describes key zodiac placements or characteristics based on the user's birth details (Date of Birth: ${input.dateOfBirth}, Time of Birth: ${input.timeOfBirth}, Place of Birth: ${input.placeOfBirth}).
    Follow this with a detailed Zodiac-based prediction for the career **${input.careerSuggestion}**. This prediction should be approximately 500 words and conclude with **exactly 10 key bullet points summarizing the astrological outlook** for this career.
    Frame this positively and as potential influences.
    
    ## Numerological Insights
    (This entire section's text must be in ${input.preferredLanguage})
    **Life Path Number:** ${input.lifePathNumber}
    
    Briefly explain the general meaning and characteristics typically associated with Life Path Number ${input.lifePathNumber}.
    Then, based on this Life Path Number (${input.lifePathNumber}) and the user's full Date of Birth (${input.dateOfBirth}), provide a detailed Numerology-based prediction for the career **${input.careerSuggestion}**. This prediction should be approximately 200 words and conclude with **exactly 10 key bullet points summarizing the numerological outlook** for this career.
    Frame this positively and as potential influences.
    
    ## Career Prospect & Why It Is a Good Fit for You?
    (This entire section's text must be in ${input.preferredLanguage})
    Elaborate on the prospects of the career **${input.careerSuggestion}** generally, and then specifically explain why it is a good fit for ${input.userName}, drawing connections to their stated traits, personality profile (${input.personalityProfile}), and personalized answers. **Crucially, do NOT mention the internal trait codes (e.g., 's1q1', 's2q3') in your response.** Instead, refer to the concepts they represent (e.g., 'preference for teamwork,' 'creative interests').
    
    ## 10-Year Career Roadmap (Age-Specific for ${input.careerSuggestion}})
    (This entire section's text must be in ${input.preferredLanguage})
    Generate a detailed 10-year career roadmap for ${input.userName}, starting from their current age of ${input.age}.
    For each of the 10 years:
    -   Use a main heading (e.g., "### Year 1 (Age ${input.age}): Foundation Building"). Increment age for subsequent years. (Translate "Year X (Age Y): Title" into ${input.preferredLanguage})
    -   **Title:** A concise title for the year's focus. (In ${input.preferredLanguage})
    -   **Description:** A paragraph describing objectives and focus. (In ${input.preferredLanguage})
    -   **Expected Salary:** Estimated salary range, **localized for ${input.country} with currency symbol/name** (e.g., "₹X,XX,XXX - ₹Y,YY,YYY INR" or "$XX,000 - $YY,000 USD"). The salary figures and currency should remain, but descriptive text around it should be in ${input.preferredLanguage}.
    -   **Suggested Courses:** Bulleted list of relevant courses. (In ${input.preferredLanguage})
    -   **Key Activities:** Bulleted list of activities (networking, projects). (In ${input.preferredLanguage})
    
    ## Suggested Education, Courses & Programmes
    (This entire section's text must be in ${input.preferredLanguage})
    Provide specific guidance on relevant degrees (Bachelor's, Master's, PhD), important certifications, online courses, and other academic/vocational programmes beneficial for pursuing a career in **${input.careerSuggestion}**.
    
    ## Key Interests (Top 5)
    (This entire section's text must be in ${input.preferredLanguage})
    Based on the user's traits (which you must not mention directly) and personalized answers (Hobbies: ${input.personalizedAnswers.q2}, Motivations: ${input.personalizedAnswers.q5}, Ideal Workday: ${input.personalizedAnswers.q1}), identify and list their Top 5 Key Interests relevant to career exploration. Present as a bulleted list.
    - Interest 1 (in ${input.preferredLanguage})
    - Interest 2 (in ${input.preferredLanguage})
    - ...
    
    ## Expected Salary (Localized for ${input.country})
    (Descriptive text in ${input.preferredLanguage}, salary figures/currency remain as is)
    Provide specific, localized salary expectations for ${input.careerSuggestion} in ${input.country} at these milestones:
    -   **Year 1 (Starting):** [Salary Range with Currency] (Translate "Year 1 (Starting)" to ${input.preferredLanguage})
    -   **Year 5:** [Salary Range with Currency] (Translate "Year 5" to ${input.preferredLanguage})
    -   **Year 10:** [Salary Range with Currency] (Translate "Year 10" to ${input.preferredLanguage})
    
    ## 20-Year Outlook & Future Trends for ${input.careerSuggestion}
    (This entire section's text must be in ${input.preferredLanguage})
    Provide a forward-looking perspective on how the field of **${input.careerSuggestion}** might evolve over the next 20 years. Discuss potential technological advancements, shifts in demand, emerging specializations, and key future trends. What skills will likely remain valuable or become even more critical? How can one prepare for long-term success in this career, especially considering future technological integration?
    
    ---
    (The following promotional text and links should also be in ${input.preferredLanguage}. If the AI cannot reliably translate the links or pricing, it should retain them in English but translate the surrounding promotional text.)
    Need a professional career guide? We will offer a professional career guide who will keep you on track to achive your goals and will guide and connect you to right people to build confidence to succeed. Annual subscription of Rs. 2999/-
    
    **For further assistance:**
    
    *   [➡️ Contact Our Career Counsellor](/contact)
    *   [➡️ Subscribe Now for Professional Guidance (Rs. 2999/-)](/subscribe-guidance)** - Unlock ongoing support and resources.
    --- END OF REPORT MARKDOWN ---
    Return ONLY the raw markdown content for the report.
    `;
}

export async function POST(req: Request) {
  const db = getDb();
  let paymentDocRef: FirebaseFirestore.DocumentReference | null = null;
  let newReportId: string | null = null;

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHENTICATED: Missing token' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await getAuth().verifyIdToken(idToken);
    const userId = decoded.uid;

    const { plan, language, career, allSuggestions, paymentId } = await req.json();
    if (!plan || !language || !career || !paymentId) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }
    
    paymentDocRef = db.collection('payments').doc(paymentId);

    // --- Transaction to ensure atomicity ---
    const reportMarkdown = await runTransaction(db, async (transaction) => {
        const paymentDoc = await transaction.get(paymentDocRef!);
        
        // SERVER-SIDE ENTITLEMENT CHECK
        if (!paymentDoc.exists) {
            throw new Error(`Payment record not found.`);
        }
        const paymentData = paymentDoc.data()!;
        if (paymentData.userId !== userId) {
            throw new Error(`Payment does not belong to the current user.`);
        }
        if (paymentData.status !== 'SUCCESS') {
            throw new Error(`Payment status is not 'SUCCESS'.`);
        }
        if (paymentData.reportId) {
            throw new Error(`This payment has already been used to generate a report.`);
        }

        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) throw new Error('User not found.');
        
        const userData = userDoc.data()!;
        const { name, country, birthDetails, userTraits, personalizedAnswers } = userData;
        if (!name || !birthDetails || !userTraits || !personalizedAnswers) {
            throw new Error('User profile incomplete.');
        }

        const selectedCareerDetails = allSuggestions.find((s: any) => s.name === career);
        if (!selectedCareerDetails) throw new Error('Career not found.');

        const age = differenceInYears(new Date(), parseISO(birthDetails.dateOfBirth));
        const lifePathNumber = calculateLifePathNumber(birthDetails.dateOfBirth);

        const baseInput = {
            careerSuggestion: selectedCareerDetails.name, userTraits, country, userName: name,
            dateOfBirth: birthDetails.dateOfBirth, timeOfBirth: birthDetails.timeOfBirth,
            placeOfBirth: birthDetails.placeOfBirth, age, personalizedAnswers,
            matchScore: selectedCareerDetails.matchScore || 'N/A',
            personalityProfile: selectedCareerDetails.personalityProfile || 'N/A',
            lifePathNumber, preferredLanguage: language,
        };

        let prompt: string;
        let maxTokens: number;
        switch (plan) {
            case 'verdict': prompt = getVerdictPrompt(baseInput); maxTokens = 2048; break;
            case 'clarity':
                prompt = getClarityPrompt({
                    ...baseInput,
                    alternativeCareers: allSuggestions.filter((s: any) => s.name !== career).slice(0, 2),
                });
                maxTokens = 4096;
                break;
            case 'blueprint': prompt = getBlueprintPrompt(baseInput); maxTokens = 8192; break;
            default: throw new Error('Invalid plan.');
        }

        const generatedMarkdown = await callVertexAISecurely(prompt, 'gemini-1.5-flash-001', maxTokens, 0.7);

        // Save report and get its ID
        newReportId = await saveReport(db, {
            userId, userName: name, careerName: selectedCareerDetails.name,
            reportMarkdown: generatedMarkdown, language, paymentId, plan,
            assessmentData: {
                userTraits,
                matchScore: selectedCareerDetails.matchScore || 'N/A',
                personalityProfile: selectedCareerDetails.personalityProfile || 'N/A',
            },
        });

        // "Consume" the payment record by linking it to the new report
        transaction.update(paymentDocRef!, { reportId: newReportId });

        return generatedMarkdown;
    });

    return NextResponse.json({ roadmapMarkdown: reportMarkdown });

  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] generate-and-save-report error:`, err);
    
    // Attempt to log the error to the payment document for debugging
    if (paymentDocRef) {
        try {
            await paymentDocRef.update({
                status: 'FAILED',
                error: err.message || 'An unknown error occurred.',
            });
        } catch (logError) {
            console.error('Failed to log error to payment document:', logError);
        }
    }
    
    if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
       return NextResponse.json({ error: 'Authentication failed. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
