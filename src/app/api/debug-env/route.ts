
import { NextResponse } from 'next/server';

export async function GET() {
  // This is a server-side route. It can safely access server-only environment variables.
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET; // Note: No NEXT_PUBLIC_ prefix

  return NextResponse.json({
    "NEXT_PUBLIC_RAZORPAY_KEY_ID": razorpayKeyId ? "LOADED" : "NOT FOUND",
    "RAZORPAY_KEY_SECRET": razorpayKeySecret ? "LOADED" : "NOT FOUND"
  });
}
