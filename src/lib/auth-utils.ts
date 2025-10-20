
'use server';

import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin'; // Using admin SDK for server-side verification

/**
 * Verifies the user's session cookie on the server-side.
 * Throws an error if the user is not authenticated.
 * @returns The decoded user token containing user details like uid, email, etc.
 */
export async function getAuthenticatedUser() {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    throw new Error('Authentication Error: No session cookie provided. User is not logged in.');
  }

  try {
    // Lazily initializes Admin SDK and gets auth service
    const adminAuth = await auth();
    const decodedIdToken = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    return decodedIdToken;
  } catch (error) {
    console.error('Authentication Error:', error);
    throw new Error('Authentication Error: Invalid session cookie. Please log in again.');
  }
}
