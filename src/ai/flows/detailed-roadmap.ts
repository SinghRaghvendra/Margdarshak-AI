
'use server';

/**
 * @fileOverview A flow that provides a detailed career report in Markdown format.
 * Includes personal details, astrological/numerological reviews, a 10-year age-specific roadmap (localized salary, courses, activities),
 * education guidance, study goals, skills focus, key interests and a 20-year outlook based on future trends.
 * Also includes the career's match score and aligned personality profile.
 *
 * - generateRoadmap - A function that generates a detailed career roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  roadmapMarkdown: z.string().describe(`A comprehensive career report in Markdown format. It must follow this structure EXACTLY and be in the {{{preferredLanguage}}}:
1.  "# Career Option: [Career Name]"
2.  "## Match Score: [Percentage Match Score, e.g., 85%]"
3.  "## Career Fit Assessment: [Qualitative assessment of fit]"
4.  "## Personal Details"
    -   "**Name:** [User Name]"
    -   "**DOB:** [User DOB]"
    -   "**Age:** [User Age]"
    -   "**Country:** [User Country]"
5.  "## Personality Profile Alignment: [Descriptive Personality Profile]"
6.  "## Astrological Insights & Zodiac Chart Overview:"
    -   Textual overview/description of key zodiac placements based on birth details.
    -   Detailed Zodiac based prediction (approx. 500 words and 10 key bullet points).
7.  "## Numerological Insights:"
    -   "**Life Path Number:** [Calculated Life Path Number]"
    -   Brief explanation of the general meaning of the Life Path Number.
    -   Detailed Numerology based prediction (approx. 200 words and 10 key bullet points) based on the Life Path Number and DOB, for the career.
8.  "## Career Prospect & Why It Is a Good Fit for You?"
9.  "## 10-Year Career Roadmap (Age-Specific for [Career Name]):" (For each of the 10 years, considering current age: title, description, localized expected salary with currency, suggested courses, key activities).
10. "## Suggested Education, Courses & Programmes:"
11. "## Key Interests (Top 5):" (Derived from user traits and personalized answers, presented as a bulleted list).
12. "## Expected Salary (Localized): Year 1, Year 5, Year 10" (Specific salary expectations for these milestones, localized with currency name/symbol).
13. "## 20-Year Outlook & Future Trends for [Career Name]"
14. Concluding Section: This includes the promotional text "Need a professional career guide... Annual subscription of Rs. 2999/-", followed by clear, prominent Markdown links: one to contact a career counsellor (linking to /contact) and one to subscribe for professional guidance (linking to /subscribe-guidance, mentioning the price).
Use Markdown headings (e.g. #, ##, ###) for all main sections and sub-sections as appropriate. Format lists clearly. All textual output must be in the specified {{{preferredLanguage}}}.`),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinalComprehensiveReportPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career counselor preparing a comprehensive, personalized career report.
The report MUST be in Markdown format and STRICTLY follow the structure and content guidelines below.
The ENTIRE textual content of the report (headings, descriptions, predictions, advice, etc.) MUST be in the following language: **{{{preferredLanguage}}}**.

Report for: {{{userName}}}
Chosen Career: {{{careerSuggestion}}}
User's Current Age: {{{age}}}
User's Country (for localization): {{{country}}}
User's Date of Birth: {{{dateOfBirth}}}
User's Time of Birth: {{{timeOfBirth}}}
User's Place of Birth: {{{placeOfBirth}}}
User Traits Summary: {{{userTraits}}}
User's Personalized Answers:
Ideal Workday: {{{personalizedAnswers.q1}}}
Hobbies & Interests: {{{personalizedAnswers.q2}}}
5-Year Vision: {{{personalizedAnswers.q3}}}
Industry Interest: {{{personalizedAnswers.q4}}}
Career Motivations: {{{personalizedAnswers.q5}}}
User's Life Path Number: {{{lifePathNumber}}}

--- START OF REPORT MARKDOWN (in {{{preferredLanguage}}}) ---

# Career Option: {{{careerSuggestion}}}

## Match Score: {{{matchScore}}}

## Career Fit Assessment
Provide a qualitative assessment (2-3 sentences) of why this career is a strong, moderate, or developing fit for {{{userName}}}, based on their traits, answers, and personality profile alignment. (Ensure this text is in {{{preferredLanguage}}})

## Personal Details
- **Name:** {{{userName}}}
- **DOB:** {{{dateOfBirth}}}
- **Age:** {{{age}}}
- **Country:** {{{country}}}
(Field names like "Name", "DOB", "Age", "Country" should be translated to {{{preferredLanguage}}} if appropriate for that language's conventions in reports, otherwise keep them in English but ensure the values are presented correctly.)

## Personality Profile Alignment: {{{personalityProfile}}}
Briefly elaborate (1-2 sentences) on how the user's personality profile ({{{personalityProfile}}}) aligns with the demands and characteristics of the career in {{{careerSuggestion}}}. (Ensure this text is in {{{preferredLanguage}}})

## Astrological Insights & Zodiac Chart Overview
(This entire section's text must be in {{{preferredLanguage}}})
Provide a textual overview that describes key zodiac placements or characteristics based on the user's birth details (Date of Birth: {{{dateOfBirth}}}, Time of Birth: {{{timeOfBirth}}}, Place of Birth: {{{placeOfBirth}}}).
Follow this with a detailed Zodiac-based prediction for the career **{{{careerSuggestion}}}**. This prediction should be approximately 500 words and conclude with **exactly 10 key bullet points summarizing the astrological outlook** for this career.
Frame this positively and as potential influences.

## Numerological Insights
(This entire section's text must be in {{{preferredLanguage}}})
**Life Path Number:** {{{lifePathNumber}}}

Briefly explain the general meaning and characteristics typically associated with Life Path Number {{{lifePathNumber}}}.
Then, based on this Life Path Number ({{{lifePathNumber}}}) and the user's full Date of Birth ({{{dateOfBirth}}}), provide a detailed Numerology-based prediction for the career **{{{careerSuggestion}}}**. This prediction should be approximately 200 words and conclude with **exactly 10 key bullet points summarizing the numerological outlook** for this career.
Frame this positively and as potential influences.

## Career Prospect & Why It Is a Good Fit for You?
(This entire section's text must be in {{{preferredLanguage}}})
Elaborate on the prospects of the career **{{{careerSuggestion}}}** generally, and then specifically explain why it is a good fit for {{{userName}}}, drawing connections to their stated traits: ({{{userTraits}}}), personality profile ({{{personalityProfile}}}), and personalized answers.

## 10-Year Career Roadmap (Age-Specific for {{{careerSuggestion}}})
(This entire section's text must be in {{{preferredLanguage}}})
Generate a detailed 10-year career roadmap for {{{userName}}}, starting from their current age of {{{age}}}.
For each of the 10 years:
-   Use a main heading (e.g., "### Year 1 (Age {{{age}}}): Foundation Building"). Increment age for subsequent years. (Translate "Year X (Age Y): Title" into {{{preferredLanguage}}})
-   **Title:** A concise title for the year's focus. (In {{{preferredLanguage}}})
-   **Description:** A paragraph describing objectives and focus. (In {{{preferredLanguage}}})
-   **Expected Salary:** Estimated salary range, **localized for {{{country}}} with currency symbol/name** (e.g., "₹X,XX,XXX - ₹Y,YY,YYY INR" or "$XX,000 - $YY,000 USD"). The salary figures and currency should remain, but descriptive text around it should be in {{{preferredLanguage}}}.
-   **Suggested Courses:** Bulleted list of relevant courses. (In {{{preferredLanguage}}})
-   **Key Activities:** Bulleted list of activities (networking, projects). (In {{{preferredLanguage}}})

## Suggested Education, Courses & Programmes
(This entire section's text must be in {{{preferredLanguage}}})
Provide specific guidance on relevant degrees (Bachelor's, Master's, PhD), important certifications, online courses, and other academic/vocational programmes beneficial for pursuing a career in **{{{careerSuggestion}}}**.

## Key Interests (Top 5)
(This entire section's text must be in {{{preferredLanguage}}})
Based on the user's traits ({{{userTraits}}}) and personalized answers (Hobbies: {{{personalizedAnswers.q2}}}, Motivations: {{{personalizedAnswers.q5}}}, Ideal Workday: {{{personalizedAnswers.q1}}}), identify and list their Top 5 Key Interests relevant to career exploration. Present as a bulleted list.
- Interest 1 (in {{{preferredLanguage}}})
- Interest 2 (in {{{preferredLanguage}}})
- ...

## Expected Salary (Localized for {{{country}}})
(Descriptive text in {{{preferredLanguage}}}, salary figures/currency remain as is)
Provide specific, localized salary expectations for {{{careerSuggestion}}} in {{{country}}} at these milestones:
-   **Year 1 (Starting):** [Salary Range with Currency] (Translate "Year 1 (Starting)" to {{{preferredLanguage}}})
-   **Year 5:** [Salary Range with Currency] (Translate "Year 5" to {{{preferredLanguage}}})
-   **Year 10:** [Salary Range with Currency] (Translate "Year 10" to {{{preferredLanguage}}})

## 20-Year Outlook & Future Trends for {{{careerSuggestion}}}
(This entire section's text must be in {{{preferredLanguage}}})
Provide a forward-looking perspective on how the field of **{{{careerSuggestion}}}** might evolve over the next 20 years. Discuss potential technological advancements, shifts in demand, emerging specializations, and key future trends. What skills will likely remain valuable or become even more critical? How can one prepare for long-term success in this career, especially considering future technological integration?

---
(The following promotional text and links should also be in {{{preferredLanguage}}}. If the AI cannot reliably translate the links or pricing, it should retain them in English but translate the surrounding promotional text.)
Need a professional career guide? We will offer a professional career guide who will keep you on track to achive your goals and will guide and connect you to right people to build confidence to succeed. Annual subscription of Rs. 2999/-

**For further assistance:**

*   **[➡️ Contact Our Career Counsellor](/contact)** - Get personalized advice from our experts.
*   **[➡️ Subscribe Now for Professional Guidance (Rs. 2999/-)](/subscribe-guidance)** - Unlock ongoing support and resources.
--- END OF REPORT MARKDOWN ---
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }, // Astrology/numerology
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateFinalComprehensiveReportFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid roadmap output for the final report.");
    }
    return output;
  }
);
