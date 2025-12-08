
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model, maxOutputTokens } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt missing" }, { status: 400 });
    }

    // Secure key from Secret Manager (Next.js automatically injects env)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // This is a server-side error, so it's safe to be specific.
      return NextResponse.json({ error: "API key not found on server" }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxOutputTokens || 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        // Log the actual error from the Gemini API on the server for debugging
        console.error("Gemini API Error:", data.error);
        return NextResponse.json({ error: data.error?.message || "An error occurred with the Gemini API." }, { status: response.status });
    }

    // Check for safety blocks BEFORE trying to access the text
    if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === 'SAFETY') {
        const blockReason = data.promptFeedback?.blockReason || 'Unknown safety concern';
        console.warn(`Gemini request blocked. Reason: ${blockReason}`);
        return NextResponse.json({ error: `Request was blocked by safety filters. Reason: ${blockReason}` }, { status: 400 });
    }
    
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text from Gemini.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
