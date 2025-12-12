
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json({ error: 'Razorpay API key secret not configured.' }, { status: 500 });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Signature is valid
      // Here you would typically update your database that the order is paid
      return NextResponse.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      // Signature is invalid
      return NextResponse.json({ success: false, error: 'Payment verification failed. Signature mismatch.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error.message || 'Internal Server Error');
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
