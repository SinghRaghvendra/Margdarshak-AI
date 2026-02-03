
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto, { randomBytes } from 'crypto';

export const runtime = 'nodejs'; // Ensure Node.js runtime

export async function POST(request: Request) {
  const { amount, coupon } = await request.json();

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Missing Keys:', { keyId: !!keyId, keySecret: !!keySecret });
    return NextResponse.json({ error: 'Razorpay API keys not configured.' }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let finalAmount = Number(amount);

  if (coupon) {
    const upperCaseCoupon = coupon.toUpperCase();
    if (upperCaseCoupon === 'RAGHVENDRA100') {
        finalAmount = 1; // Set amount to 1 INR for testing
    } else if (upperCaseCoupon === 'AICOUNCEL25') {
        finalAmount = finalAmount * 0.75; // Apply 25% discount
    }
  }

  // Ensure amount is an integer and in paise
  const amountInPaise = Math.round(finalAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_order_${randomBytes(6).toString('hex')}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, key_id: keyId });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    
    const errorMessage = error.error?.description || error.message || 'Failed to create order due to an unknown Razorpay error.';
    return NextResponse.json({ error: errorMessage }, { status: error.statusCode || 500 });
  }
}
