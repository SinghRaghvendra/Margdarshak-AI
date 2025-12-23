import { NextResponse } from 'next/server';

export async function GET() {
  // This is a server-side route. It can safely access server-only environment variables.
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // We check for presence, not the value, to avoid leaking secrets.
  return NextResponse.json({
    "FIREBASE_PROJECT_ID": projectId ? "LOADED" : "NOT FOUND",
    "FIREBASE_CLIENT_EMAIL": clientEmail ? "LOADED" : "NOT FOUND",
    "FIREBASE_PRIVATE_KEY": privateKey ? "LOADED" : "NOT FOUND",
    "NODE_ENV": process.env.NODE_ENV
  });
}
