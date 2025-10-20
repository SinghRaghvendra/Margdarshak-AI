
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

  // The Admin SDK is initialized lazily. By the time this function is called at runtime, it should be ready.
  if (!auth.app) {
    // This case should ideally not be hit if the env var is set correctly, but it's a good safeguard.
    throw new Error('Authentication Error: Firebase Admin SDK not initialized on the server.');
  }

  try {
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    return decodedIdToken;
  } catch (error) {
    console.error('Authentication Error:', error);
    throw new Error('Authentication Error: Invalid session cookie. Please log in again.');
  }
}
