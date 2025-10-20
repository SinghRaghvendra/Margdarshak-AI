
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto, { randomBytes } from 'crypto';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const runtime = 'nodejs'; // Ensure Node.js runtime

export async function POST(request: Request) {
  try {
    await getAuthenticatedUser(); // Secure the route
  } catch (authError: any) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }

  const { amount } = await request.json();

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay API keys not configured.' }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: Number(amount) * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_order_${randomBytes(6).toString('hex')}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, key_id: keyId });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
