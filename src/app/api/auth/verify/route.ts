
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';

// This endpoint is used by the middleware to verify the session cookie.
// It doesn't need to do anything other than be successfully called if the cookie is valid.
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ status: 'error', message: 'No session cookie' }, { status: 401 });
  }

  try {
    // Lazily initializes and gets the auth service
    const adminAuth = auth();
    await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Invalid session cookie' }, { status: 401 });
  }
}
