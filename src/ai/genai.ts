// src/ai/genai.ts
'use server';

import { GoogleAuth } from 'google-auth-library';

// Environment variables
const DEFAULT_MODEL_ID = process.env.MODEL_ID || 'gemini-2.5-flash';
const DEFAULT_REGION = process.env.REGION || 'us-central1';
const PROJECT_ID = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'margdarshak-ai';

type GenOptions = {
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
    region?: string;
    responseMimeType?: 'text/plain' | 'application/json';
};

async function getAccessToken(): Promise<string> {
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const t = await client.getAccessToken();
    if (!t || !t.token) throw new Error('Failed to obtain access token from service account.');
    return t.token;
}

/**
 * ✅ FIX 1: Fully Robust Text Extractor
 * Handles parts[].text, content[].text, and output_text (common for JSON responses).
 */
function extractModelText(response: any): string | null {
    if (!response) return null;

    // 1. Check the primary candidate structure
    const c = response?.candidates?.[0];

    // parts[].text (Primary Check)
    const parts = c?.content?.parts;
    if (Array.isArray(parts)) {
        for (const part of parts) {
            if (typeof part?.text === "string") return part.text;
        }
    }
    
    // content[].text (Alternate/Old Structure)
    const alt = c?.content;
    if (Array.isArray(alt)) {
        for (const part of alt) {
            if (typeof part?.text === "string") return part.text;
        }
    }

    // 2. Check top-level response fields (for non-standard formats, e.g., output_text)
    if (typeof response?.output_text === "string") return response.output_text;
    if (typeof response?.text === "string") return response.text; 

    return null;
}


export async function generateContent(promptText: string, options?: GenOptions): Promise<string> {
    const modelToUse = options?.model || DEFAULT_MODEL_ID;
    const regionToUse = options?.region || DEFAULT_REGION;
    const maxOutput = options?.maxOutputTokens ?? 2048;

    // Standardize the region for all global Gemini calls to the working region.
    const endpointRegion = 'us-central1'; 
    
    try {
        const token = await getAccessToken();

        const body: any = {
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: maxOutput,
                // ✅ FIX 2: Correct MIME Type Placement (Inside generationConfig for Vertex REST API)
                ...(options?.responseMimeType && { responseMimeType: options.responseMimeType }),
            },
            // ✅ Looser safety settings for successful testing
            safetySettings: [
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            ],
        };
        
        // Use the standard, reliable non-streaming endpoint
        const url = `https://${endpointRegion}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${endpointRegion}/publishers/google/models/${modelToUse}:generateContent`;
        
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorBodyText = await res.text();
            // This is the CRITICAL log that reveals 400, 403 errors
            console.error(`🚨 Vertex AI HTTP ${res.status} Error:`, errorBodyText);
            throw new Error(`Vertex AI HTTP ${res.status}: ${errorBodyText}`);
        }

        const responseJson = await res.json();
        console.log("🔍 RAW VERTEX RESPONSE:\n", JSON.stringify(responseJson, null, 2));

        const aggregatedText = extractModelText(responseJson);

        if (aggregatedText === null || aggregatedText.trim() === '') {
            const finishReason = responseJson?.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                console.error("AI response was blocked due to safety settings.", responseJson.candidates[0].safetyRatings);
                throw new Error('The response was blocked due to safety filters. Please adjust your input.');
            }
            throw new Error('No valid text returned from Vertex AI. The response was empty or in an unexpected format.');
        }

        return aggregatedText;

    } catch (err: any) {
        console.error('generateContent error:', err);
        // Throw the specific internal error detail which will be caught in suggestCareers
        throw new Error(`${err.message || String(err)}`);
    }
}

export async function generateReport(prompt: string) {
    return generateContent(prompt, { model: 'gemini-2.5-flash', temperature: 0.8, maxOutputTokens: 8192 });
}
