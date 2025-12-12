
'use server';

/**
 * @fileOverview A flow that provides a detailed career report in Markdown format.
 * This file has been refactored to use the central /api/gemini route for stability.
 */

import {z} from 'zod';

// Define PersonalizedAnswersSchema here to be used in GenerateRoadmapInputSchema
const PersonalizedAnswersSchema = z.object({
  q1: z.string().describe("Answer to: Describe your ideal workday. What kind of tasks energize you, and what kind of tasks drain you?"),
  q2: z.string().describe("Answer to: What are some of your hobbies or activities you genuinely enjoy outside of work or study? What do you like about them?"),
  q3: z.string().describe("Answer to: Imagine yourself 5 years from now. What achievements, big or small, would make you feel proud and fulfilled in your professional life?"),
  q4: z.string().describe("Answer to: Are there any specific industries or types of companies that particularly interest you or you feel drawn to? Why?"),
  q5: z.string().describe("Answer to: What are your primary motivations when thinking about a career? (e.g., financial security, making an impact, continuous learning, work-life balance, creativity, leadership, etc.). Please elaborate."),
});

const GenerateRoadmapInputSchema = z.object({
  careerSuggestion: z.string().describe('The suggested career for which to generate the roadmap.'),
  userTraits: z.string().describe('The user traits to consider when generating the roadmap.'),
  country: z.string().describe('The country of the user, to help localize salary expectations and career prospects.'),
  userName: z.string().describe("The user's full name."),
  dateOfBirth: z.string().describe("User's date of birth in YYYY-MM-DD format."),
  timeOfBirth: z.string().describe("User's time of birth, including AM/PM if applicable (e.g., \"10:30 AM\" or \"14:45\")."),
  placeOfBirth: z.string().describe("User's city and country of birth."),
  age: z.number().describe("User's current age."),
  personalizedAnswers: PersonalizedAnswersSchema.describe("User's answers to personalized questions."),
  matchScore: z.string().describe('The percentage match score for this career option (e.g., "85%").'),
  personalityProfile: z.string().describe('The descriptive personality profile associated with this career fit (e.g., "Analytical and Strategic", "Creative and Empathetic").'),
  lifePathNumber: z.number().describe("The user's calculated Life Path Number based on their date of birth."),
  preferredLanguage: z.string().describe('The user\'s preferred language for the report (e.g., "English", "Hindi", "Spanish"). This should apply to all textual content of the report.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmapMarkdown: z.string().describe(`A comprehensive career report in Markdown format.`),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;


export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    const prompt = `You are an expert career counselor preparing a comprehensive, personalized career report.
    The report MUST be in Markdown format and STRICTLY follow the structure and content guidelines below.
    The ENTIRE textual content of the report (headings, descriptions, predictions, advice, etc.) MUST be in the following language: **${input.preferredLanguage}**.
    
    Report for: ${input.userName}
    Chosen Career: ${input.careerSuggestion}
    User's Current Age: ${input.age}
    User's Country (for localization): ${input.country}
    User's Date of Birth: ${input.dateOfBirth}
    User's Time of Birth: ${input.timeOfBirth}
    User's Place of Birth: ${input.placeOfBirth}
    User Traits Summary (for internal reference, do not quote these codes in the report): ${input.userTraits}
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
    
    *   [➡️ Contact Our Career Counsellor](/contact)** - Get personalized advice from our experts.
    *   [➡️ Subscribe Now for Professional Guidance (Rs. 2999/-)](/subscribe-guidance)** - Unlock ongoing support and resources.
    --- END OF REPORT MARKDOWN ---
    Return ONLY the raw markdown content for the report.
    `;

    try {
        const response = await fetch(`/api/gemini`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                model: "gemini-2.5-flash",
                maxOutputTokens: 8192,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
        }

        if (!data.text) {
             throw new Error("The AI model returned an empty response for the roadmap.");
        }
        
        return {
          roadmapMarkdown: data.text
        };
    } catch (error: any) {
        console.error(`Error generating roadmap:`, error);
        throw new Error(`Could not generate roadmap. Details: ${error.message}`);
    }
}
