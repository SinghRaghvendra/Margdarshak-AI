'use server';

import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { prompt, model = 'gemini-pro', maxOutputTokens = 512 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const vertex_ai = new VertexAI({
      project: process.env.FIREBASE_PROJECT_ID || 'margdarshak-ai',
      location: 'us-central1',
    });

    const generativeModel = vertex_ai.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: maxOutputTokens,
        temperature: 0.7,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      ],
    });

    const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const resp = await generativeModel.generateContent(request);
    const response = resp.response;

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
       throw new Error("The AI model returned an empty or invalid response.");
    }
    
    const text = response.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: err.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
