
import { NextResponse } from "next/server";

function extractText(data: any) {
  if (!data?.candidates?.length) return null;

  // Some Gemini models return content.parts
  const parts1 = data.candidates[0]?.content?.parts;

  // Some return an array of content blocks
  const parts2 = data.candidates[0]?.content?.[0]?.parts;

  const parts = parts1 || parts2;
  if (!parts) return null;

  for (const p of parts) {
    if (p?.text) return p.text;
    if (typeof p === "string") return p;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { prompt, model, maxOutputTokens } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt missing" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxOutputTokens || 2048 },
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        // Log the actual error from the Gemini API on the server for debugging
        console.error("Gemini API Error:", data.error);
        return NextResponse.json({ error: data.error?.message || "An error occurred with the Gemini API." }, { status: response.status });
    }
    
    // Check for safety blocks even with BLOCK_NONE, as some things can still be blocked.
    if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === 'SAFETY') {
        const blockReason = data.promptFeedback?.blockReason || 'Unknown safety concern';
        console.warn(`Gemini request blocked. Reason: ${blockReason}`);
        return NextResponse.json({ error: `Request was blocked by safety filters. Reason: ${blockReason}` }, { status: 400 });
    }

    const text = extractText(data) || "⚠ Gemini blocked this content or returned an empty response.";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
