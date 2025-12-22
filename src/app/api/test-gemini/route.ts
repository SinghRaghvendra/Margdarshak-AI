import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent("Say hello");

    return Response.json({ output: result.response.text() });
  } catch (err: any) {
    return Response.json({ error: err.message || err.toString() });
  }
}
