
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const idToken = await request.text();

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    // Set cookie.
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    return response;
    
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Failed to create session cookie' }, { status: 401 });
  }
}


export async function DELETE(request: NextRequest) {
  const options = {
    name: 'session',
    value: '',
    maxAge: -1,
  };
  
  // Clear cookie
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set(options);
  return response;
}
