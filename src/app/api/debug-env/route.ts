export async function GET() {
  return Response.json({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "LOADED" : "NOT FOUND"
  });
}
